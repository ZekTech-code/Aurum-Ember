import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const DEFAULT_MESSAGES = [
  'Please wait...',
  'Processing...',
  'Almost there...',
];

export default function LoadingTransition({ message, submessage, messages, duration = 2000, onComplete }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const displayMessages = messages || (message ? [message] : DEFAULT_MESSAGES);

  useEffect(() => {
    if (displayMessages.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % displayMessages.length);
    }, Math.max(duration / displayMessages.length, 800));
    return () => clearInterval(interval);
  }, [displayMessages.length, duration]);

  useEffect(() => {
    if (!onComplete) return;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <Loader2 size={32} className="text-[var(--brand-gold)] animate-spin" />

      <div className="text-center space-y-2">
        <p className="text-sm font-bold text-[var(--text-primary)]">
          {displayMessages[msgIndex]}
        </p>
        {submessage && (
          <p className="text-xs text-[var(--text-muted)]">{submessage}</p>
        )}
      </div>
    </div>
  );
}
