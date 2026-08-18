import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { useOrders } from './useOrders';
import { loadPaystackScript, generateRef } from '../utils/paystackLoader';
import {
  initializePayment,
  createVirtualAccount,
  checkPaymentStatus,
  getOrderPaymentStatus,
  getPaystackKey,
} from '../services/paymentService';

export default function usePaymentProcessing() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cart, clearCart } = useCart();
  const { addOrder, cancelOrder } = useOrders();
  const pollingRef = useRef(null);
  const processingRef = useRef(false);

  const [currentStep, setCurrentStep] = useState('select_delivery');
  const [transitioning, setTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    notes: '',
  });

  const [deliveryMethod] = useState('express');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [errors, setErrors] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const promoDiscount = 0;

  const [deliveryData] = useState({ deliveryFee: 2, zone: 'standard' });
  const [paystackKey, setPaystackKey] = useState(null);
  const [bankTransferDetails, setBankTransferDetails] = useState(null);
  const [lastOrderData, setLastOrderData] = useState(null);
  const [opayPending, setOpayPending] = useState(false);
  const [palmpayPending, setPalmpayPending] = useState(false);
  const [ussdDetails, setUssdDetails] = useState(null);
  const [authorizationUrl, setAuthorizationUrl] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryData.deliveryFee;
  const totalAmount = Math.max(0, subtotal + deliveryFee - promoDiscount);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    getPaystackKey(token).then((data) => {
      if (data?.publicKey) setPaystackKey(data.publicKey);
    });
  }, [token]);

  useEffect(() => {
    if (cart.length === 0 && !['processing', 'confirm_order', 'pay_now'].includes(currentStep)) {
      navigate('/menu');
    }
  }, [cart, navigate, currentStep]);

  const validateCheckout = useCallback(() => {
    const newErrors = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Required';
    if (!formData.phone?.trim()) newErrors.phone = 'Required';
    if (!formData.address?.trim()) newErrors.address = 'Required';
    if (!formData.city?.trim()) newErrors.city = 'Required';
    if (!formData.state?.trim()) newErrors.state = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const transitionTo = useCallback((step, text) => {
    setTransitioning(true);
    setTransitionText(text || 'Loading...');
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentStep(step);
        setTransitioning(false);
        setTransitionText('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        resolve();
      }, 1200);
    });
  }, []);

  const buildOrderData = useCallback((payStatus, paymentRef, resolvedMethod) => ({
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || '/images/jollof_rice.jpg',
    })),
    subtotal,
    deliveryFee,
    totalAmount,
    price: totalAmount,
    userEmail: user?.email || formData.email,
    deliveryInfo: formData,
    customerName: formData.fullName,
    phone: formData.phone,
    paymentMethod: resolvedMethod || paymentMethod,
    paymentStatus: payStatus,
    paymentRef,
    promoCode: promoCode || null,
    promoDiscount,
    userAvatar: user?.avatar || null,
    notes: formData.notes,
    deliveryMethod,
    date: new Date().toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    status: 'awaiting',
    approved: false,
  }), [cart, subtotal, deliveryFee, totalAmount, user, formData, paymentMethod, deliveryMethod, promoCode, promoDiscount]);

  const startPaymentPolling = useCallback((orderId, orderData) => {
    if (!orderId || orderId === 'undefined') return;
    if (pollingRef.current) clearInterval(pollingRef.current);

    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const statusRes = await getOrderPaymentStatus(orderId, token);
        if (statusRes.paymentStatus === 'paid') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          clearCart();
          navigate('/order-success', { state: { ...orderData, paymentStatus: 'paid', _id: orderId } });
          return;
        }
        if (statusRes.paymentStatus === 'failed' || statusRes.cancelled) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setToast({ message: 'Payment was not completed within 5 minutes. Your order has been cancelled.', type: 'payment_failed' });
          setBankTransferDetails(null);
          setUssdDetails(null);
          setIsProcessing(false);
          processingRef.current = false;
          setCurrentStep('pay_now');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } catch {
        /* continue polling */
      }
      if (attempts >= 120) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 5000);
  }, [token, clearCart, navigate, setToast]);

  const executePayment = useCallback(async (resolvedMethod) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    setTransitioning(true);
    setTransitionText('Initializing payment...');

    const effectiveMethod = resolvedMethod || paymentMethod;

    try {
      const ref = generateRef();

      if (effectiveMethod === 'pay_on_delivery') {
        setTransitionText('Creating your order...');
        await new Promise((r) => setTimeout(r, 1200));
        const orderData = buildOrderData('pending', null, effectiveMethod);
        const result = await addOrder(orderData);
        setLastOrderData({ ...orderData, _id: result?._id });
        clearCart();
        setIsProcessing(false);
        processingRef.current = false;
        setTransitioning(false);
        navigate('/order-success', { state: { ...orderData, _id: result?._id } });
        return;
      }

      if (effectiveMethod === 'bank_transfer') {
        setTransitionText('Generating bank account details...');
        await new Promise((r) => setTimeout(r, 1200));

        const orderData = buildOrderData('pending_transfer', ref, effectiveMethod);
        const result = await addOrder(orderData);

        try {
          const vaResult = await createVirtualAccount({
            email: formData.email || user?.email,
            amount: totalAmount,
            reference: ref,
          }, token);

          setBankTransferDetails({
            accountNumber: vaResult.data?.account_number || vaResult.data?.accountNumber,
            bankName: vaResult.data?.bank_name || vaResult.data?.bankName || 'Wema Bank',
            accountName: vaResult.data?.account_name || vaResult.data?.accountName || 'Aurum & Ember',
            amount: totalAmount,
            reference: ref,
            expiration: vaResult.data?.expiration || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          });
        } catch {
          setBankTransferDetails({
            accountNumber: '8012345678',
            bankName: 'Wema Bank',
            accountName: 'Aurum & Ember',
            amount: totalAmount,
            reference: ref,
            expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          });
        }

        setLastOrderData({ ...orderData, _id: result?._id });
        setIsProcessing(false);
        processingRef.current = false;
        setCurrentStep('processing');
        setTransitioning(false);
        setTransitionText('');

        if (result?._id) {
          startPaymentPolling(result._id, orderData);
        }
        return;
      }

      if (effectiveMethod === 'card') {
        if (!paystackKey) {
          setToast({ message: 'Payment configuration not loaded. Please refresh and try again.', type: 'error' });
          setIsProcessing(false);
          processingRef.current = false;
          setTransitioning(false);
          setCurrentStep('pay_now');
          return;
        }

        setTransitionText('Creating secure transaction...');
        await new Promise((r) => setTimeout(r, 800));

        const initResult = await initializePayment({
          email: formData.email || user?.email,
          amount: totalAmount,
          channels: ['card', 'ussd', 'bank'],
          paymentMethod: 'card',
          metadata: {
            custom_fields: [
              { display_name: 'Payment Method', variable_name: 'payment_method', value: 'card' },
              { display_name: 'Customer Name', variable_name: 'customer_name', value: formData.fullName },
            ],
          },
        }, token);

        const orderData = buildOrderData('pending', initResult.data?.reference || ref, effectiveMethod);
        const result = await addOrder(orderData);
        setLastOrderData({ ...orderData, _id: result?._id });

        setTransitionText('Opening secure payment page...');
        await loadPaystackScript();
        setTransitioning(false);
        setTransitionText('');
        setIsProcessing(false);
        processingRef.current = false;

        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: formData.email || user?.email,
          amount: Math.round(totalAmount * 100),
          currency: 'USD',
          ref: initResult.data?.reference || ref,
          channels: ['card', 'ussd', 'bank'],
          metadata: {
            custom_fields: [
              { display_name: 'Payment Method', variable_name: 'payment_method', value: 'card' },
              { display_name: 'Customer Name', variable_name: 'customer_name', value: formData.fullName },
            ],
          },
          callback(response) {
            setTransitionText('Verifying payment...');
            setTransitioning(true);
            setIsProcessing(true);
            checkPaymentStatus(response.reference, token).catch(() => {});
            clearCart();
            navigate('/order-success', { state: { ...orderData, paymentStatus: 'paid', paymentRef: response.reference, _id: result?._id } });
          },
          onClose() {
            setToast({ message: 'Payment cancelled. You can try again.', type: 'cancelled' });
            setIsProcessing(false);
            processingRef.current = false;
            setCurrentStep('pay_now');
          },
        });

        handler.openIframe();
        return;
      }

      if (effectiveMethod === 'opay' || effectiveMethod === 'palmpay') {
        if (!paystackKey) {
          setToast({ message: 'Payment configuration not loaded. Please refresh and try again.', type: 'error' });
          setIsProcessing(false);
          processingRef.current = false;
          setTransitioning(false);
          setCurrentStep('pay_now');
          return;
        }

        const methodName = effectiveMethod === 'opay' ? 'OPay' : 'PalmPay';
        setTransitionText(`Connecting securely to ${methodName}...`);
        await new Promise((r) => setTimeout(r, 1200));

        const channels = effectiveMethod === 'opay' ? ['opay'] : ['palmpay'];

        const initResult = await initializePayment({
          email: formData.email || user?.email,
          amount: totalAmount,
          channels,
          paymentMethod: effectiveMethod,
          metadata: {
            custom_fields: [
              { display_name: 'Payment Method', variable_name: 'payment_method', value: effectiveMethod },
              { display_name: 'Customer Name', variable_name: 'customer_name', value: formData.fullName },
            ],
          },
        }, token);

        const orderData = buildOrderData('pending', initResult.data?.reference || ref, effectiveMethod);
        const result = await addOrder(orderData);
        setLastOrderData({ ...orderData, _id: result?._id });

        if (initResult.data?.authorization_url) {
          setAuthorizationUrl(initResult.data.authorization_url);
        }

        setIsProcessing(false);
        processingRef.current = false;
        setTransitioning(false);
        setTransitionText('');
        setCurrentStep('processing');

        if (effectiveMethod === 'opay') {
          setOpayPending(true);
        } else {
          setPalmpayPending(true);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (effectiveMethod === 'ussd') {
        setTransitionText('Generating USSD code...');
        await new Promise((r) => setTimeout(r, 1200));

        const initResult = await initializePayment({
          email: formData.email || user?.email,
          amount: totalAmount,
          channels: ['ussd'],
          paymentMethod: 'ussd',
          metadata: {
            custom_fields: [
              { display_name: 'Payment Method', variable_name: 'payment_method', value: 'ussd' },
              { display_name: 'Customer Name', variable_name: 'customer_name', value: formData.fullName },
            ],
          },
        }, token);

        const orderData = buildOrderData('pending', initResult.data?.reference || ref, effectiveMethod);
        const result = await addOrder(orderData);
        setLastOrderData({ ...orderData, _id: result?._id });

        setUssdDetails({
          ussdCode: initResult.data?.ussd_code || '*737*000*0000#',
          bankName: initResult.data?.bank_name || 'Your Bank',
          amount: totalAmount,
          reference: initResult.data?.reference || ref,
          expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });

        setIsProcessing(false);
        processingRef.current = false;
        setCurrentStep('processing');
        setTransitioning(false);
        setTransitionText('');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (result?._id) {
          startPaymentPolling(result._id, orderData);
        }
        return;
      }
    } catch (err) {
      console.error('[Payment Error]', err);
      setIsProcessing(false);
      processingRef.current = false;
      setTransitioning(false);
      setTransitionText('');
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
      setCurrentStep('pay_now');
    }
  }, [paymentMethod, paystackKey, formData, user, totalAmount, buildOrderData, addOrder, clearCart, navigate, token, startPaymentPolling]);

  const goNext = useCallback(() => {
    if (currentStep === 'select_delivery' && !validateCheckout()) return;

    if (currentStep === 'select_delivery') {
      transitionTo('select_payment', 'Loading payment methods...');
      return;
    }

    if (currentStep === 'select_payment') {
      if (!paymentMethod) {
        setToast({ message: 'Please select a payment method', type: 'error' });
        return;
      }
      transitionTo('confirm_order', 'Reviewing your order...');
      return;
    }

    if (currentStep === 'confirm_order') {
      if (paymentMethod === 'pay_on_delivery') {
        executePayment('pay_on_delivery');
        return;
      }
      transitionTo('pay_now', 'Preparing payment...');
    }
  }, [currentStep, validateCheckout, transitionTo, paymentMethod, executePayment]);

  const goBack = useCallback(() => {
    if (isProcessing) return;

    const prevStepMap = {
      select_payment: 'select_delivery',
      confirm_order: 'select_payment',
      pay_now: 'confirm_order',
    };

    const prev = prevStepMap[currentStep];
    if (prev) {
      setCurrentStep(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, isProcessing]);

  const confirmOpayPayment = useCallback(() => {
    if (authorizationUrl) {
      setTransitionText('Redirecting to OPay...');
      setTransitioning(true);
      setTimeout(() => {
        window.location.href = authorizationUrl;
      }, 800);
    } else {
      setTransitionText('Redirecting to OPay...');
      setTransitioning(true);
      setTimeout(() => {
        window.location.href = 'https://app.opay.com';
      }, 800);
    }
  }, [authorizationUrl]);

  const confirmPalmPayPayment = useCallback(() => {
    if (authorizationUrl) {
      setTransitionText('Redirecting to PalmPay...');
      setTransitioning(true);
      setTimeout(() => {
        window.location.href = authorizationUrl;
      }, 800);
    } else {
      setTransitionText('Redirecting to PalmPay...');
      setTransitioning(true);
      setTimeout(() => {
        window.location.href = 'https://palmpay.com';
      }, 800);
    }
  }, [authorizationUrl]);

  const cancelBankTransfer = useCallback(async () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (lastOrderData?._id) {
      await cancelOrder(lastOrderData._id);
    }
    setBankTransferDetails(null);
    setLastOrderData(null);
    setIsProcessing(false);
    processingRef.current = false;
    setTransitioning(false);
    setTransitionText('');
    setCurrentStep('pay_now');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lastOrderData, cancelOrder]);

  const goBackFromPaymentPage = useCallback(() => {
    setOpayPending(false);
    setPalmpayPending(false);
    setUssdDetails(null);
    setBankTransferDetails(null);
    setAuthorizationUrl(null);
    setCurrentStep('pay_now');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    currentStep,
    transitioning,
    transitionText,
    formData,
    setFormData,
    deliveryMethod,
    paymentMethod,
    setPaymentMethod,
    errors,
    setErrors,
    subtotal,
    deliveryFee,
    totalAmount,
    cart,
    user,
    isProcessing,
    toast,
    setToast,
    promoCode,
    setPromoCode,
    promoDiscount,
    bankTransferDetails,
    opayPending,
    palmpayPending,
    ussdDetails,
    goNext,
    goBack,
    executePayment,
    cancelBankTransfer,
    confirmOpayPayment,
    confirmPalmPayPayment,
    goBackFromPaymentPage,
  };
}
