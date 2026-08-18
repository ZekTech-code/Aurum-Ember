import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, CircleUser } from 'lucide-react';

const ProfileAvatar = ({
  src,
  alt = 'User avatar',
  size = 'md',
  name,
  onImageChange,
  editable = true,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(!!src);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const sizeMap = {
    xs: { outer: 'w-8 h-8', icon: 14, camera: 'w-5 h-5', cameraIcon: 8, ring: 'ring-1', text: 'text-xs' },
    sm: { outer: 'w-14 h-14', icon: 22, camera: 'w-6 h-6', cameraIcon: 10, ring: 'ring-2', text: 'text-base' },
    md: { outer: 'w-24 h-24', icon: 36, camera: 'w-8 h-8', cameraIcon: 14, ring: 'ring-4', text: 'text-lg' },
    lg: { outer: 'w-32 h-32', icon: 48, camera: 'w-9 h-9', cameraIcon: 16, ring: 'ring-4', text: 'text-xl' },
    xl: { outer: 'w-40 h-40', icon: 56, camera: 'w-10 h-10', cameraIcon: 18, ring: 'ring-[5px]', text: 'text-2xl' },
  };

  const s = sizeMap[size] || sizeMap.md;
  const showImage = imgSrc && !imgError;

  const getInitials = useCallback(() => {
    if (!name) return '';
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [name]);

  const processFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      setImgLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result);
        setImgError(false);
        setImgLoading(false);
        onImageChange?.(reader.result);
      };
      reader.onerror = () => {
        setImgLoading(false);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (editable) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (editable) processFile(e.dataTransfer.files?.[0]);
  };

  const handleClick = () => {
    if (editable) fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (editable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleImgError = () => {
    setImgError(true);
    setImgLoading(false);
  };

  const handleImgLoad = () => {
    setImgLoading(false);
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center group ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Avatar Container ── */}
      <motion.div
        whileHover={editable ? { scale: 1.05 } : undefined}
        whileTap={editable ? { scale: 0.97 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`
          ${s.outer} rounded-full overflow-hidden
          ${s.ring} ring-(--brand-gold)/20
          shadow-xl
          border border-(--border)
          cursor-${editable ? 'pointer' : 'default'}
          transition-shadow duration-300
          group-hover:shadow-2xl group-hover:ring-(--brand-gold)/30
          relative
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={editable ? 0 : undefined}
        role={editable ? 'button' : undefined}
        aria-label={editable ? `Upload profile picture. Current: ${alt}` : alt}
      >
        {/* Skeleton Loader */}
        <AnimatePresence>
          {imgLoading && showImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-(--bg-secondary) z-10"
            >
              <Loader2 size={s.icon * 0.5} className="animate-spin text-(--text-muted)" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Image ── */}
        <AnimatePresence>
          {showImage && (
            <motion.img
              key={imgSrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              src={imgSrc}
              alt={alt}
              className="w-full h-full object-cover"
              onError={handleImgError}
              onLoad={handleImgLoad}
              draggable={false}
            />
          )}
        </AnimatePresence>

        {/* ── Default Avatar / Fallback ── */}
        {!showImage && (
          <div className="w-full h-full bg-(--bg-secondary) flex items-center justify-center">
            {name ? (
              <span className={`${s.text} font-bold text-(--brand-gold) select-none`}>
                {getInitials()}
              </span>
            ) : (
              <CircleUser
                size={s.icon}
                className="text-(--brand-gold)/60"
                strokeWidth={1.5}
              />
            )}
          </div>
        )}

        {/* ── Drag Overlay ── */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-(--brand-gold)/20 backdrop-blur-sm rounded-full flex items-center justify-center z-20 border-2 border-dashed border-(--brand-gold)"
            >
              <Camera size={s.icon * 0.5} className="text-(--brand-gold)" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Camera Button ── */}
      {editable && (
        <motion.div
          initial={{ opacity: 0.6, scale: 0.9 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          className={`
            absolute -bottom-0.5 -right-0.5
            ${s.camera} rounded-full
            bg-(--brand-gold) text-white
            flex items-center justify-center
            shadow-lg
            border-[2.5px] border-(--bg-card)
            opacity-70 group-hover:opacity-100
            transition-opacity duration-200
            cursor-pointer z-10
          `}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          aria-label="Change profile picture"
        >
          <Camera size={s.cameraIcon} />
        </motion.div>
      )}

      {/* ── Hidden File Input ── */}
      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/gif,image/webp"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default ProfileAvatar;
