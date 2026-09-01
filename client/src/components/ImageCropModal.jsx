import { useState, useRef, useEffect, useCallback } from "react";
import Button from "./Button";

const PRESET_BANNERS = [
    {
        name: "Deep Ocean",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
    },
    {
        name: "Cyber Neon",
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
    },
    {
        name: "Sunset Horizon",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    },
    {
        name: "Campus Library",
        url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    },
    {
        name: "Minimal Dark Wave",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    },
    {
        name: "Aurora Borealis",
        url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80",
    }
];

const FILTERS = [
    { id: "none", name: "Normal", filter: "none" },
    { id: "vivid", name: "Vivid", filter: "contrast(115%) saturate(135%)" },
    { id: "warm", name: "Warm", filter: "sepia(25%) saturate(120%) brightness(105%)" },
    { id: "cool", name: "Cool", filter: "hue-rotate(190deg) saturate(110%)" },
    { id: "noir", name: "Noir", filter: "grayscale(100%) contrast(125%)" },
    { id: "cyber", name: "Cyber", filter: "hue-rotate(280deg) saturate(150%) contrast(110%)" },
];

const ImageCropModal = ({
    isOpen,
    onClose,
    onSave,
    currentImage = "",
    title = "Edit Cover Image",
    aspectRatio = 3.6, 
    cropShape, 
    outputWidth = 1200,
    allowRemove = true,
}) => {
    const isRound = cropShape ? cropShape === "round" : aspectRatio === 1;
    const [imageSrc, setImageSrc] = useState(currentImage || "");
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [viewportSize, setViewportSize] = useState({ width: 600, height: 320 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0); 
    const [flipH, setFlipH] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("none");
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("crop"); 
    const [urlInput, setUrlInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef(null);
    const viewportRef = useRef(null);

    const updateViewportDimensions = useCallback(() => {
        if (viewportRef.current) {
            const w = viewportRef.current.clientWidth;
            const h = isRound ? 320 : w / aspectRatio;
            setViewportSize({ width: w, height: h });
        }
    }, [aspectRatio, isRound]);

    useEffect(() => {
        if (!imageSrc) {
            setNaturalSize({ width: 0, height: 0 });
            return;
        }

        const img = new Image();
        img.onload = () => {
            setNaturalSize({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        };
        img.src = imageSrc;
    }, [imageSrc]);

    useEffect(() => {
        if (isOpen) {
            setImageSrc(currentImage || "");
            setZoom(1);
            setRotation(0);
            setFlipH(false);
            setSelectedFilter("none");
            setPan({ x: 0, y: 0 });
            setErrorMessage("");
            setActiveTab(currentImage ? "crop" : "upload");

            setTimeout(() => {
                updateViewportDimensions();
            }, 50);
        }
    }, [isOpen, currentImage, updateViewportDimensions]);

    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener("resize", updateViewportDimensions);
        return () => window.removeEventListener("resize", updateViewportDimensions);
    }, [isOpen, updateViewportDimensions]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMessage("Please select a valid image file (JPG, PNG, WebP).");
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setErrorMessage("Image is too large. Please select an image under 20MB.");
            return;
        }

        setErrorMessage("");
        const reader = new FileReader();
        reader.onload = (event) => {
            setImageSrc(event.target.result);
            setZoom(1);
            setPan({ x: 0, y: 0 });
            setRotation(0);
            setFlipH(false);
            setActiveTab("crop");
        };
        reader.readAsDataURL(file);
    };

    const handleApplyUrl = (e) => {
        e?.preventDefault();
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        setImageSrc(trimmed);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
        setFlipH(false);
        setActiveTab("crop");
    };

    const handleMouseDown = (e) => {
        if (!imageSrc) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    }, [isDragging, dragStart]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (!imageSrc || !e.touches[0]) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    };

    const handleTouchMove = (e) => {
        if (!isDragging || !e.touches[0]) return;
        const touch = e.touches[0];
        setPan({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
        });
    };

    const handleAlignPosition = (pos) => {
        if (pos === "top") setPan(prev => ({ ...prev, y: 40 }));
        else if (pos === "center") setPan({ x: 0, y: 0 });
        else if (pos === "bottom") setPan(prev => ({ ...prev, y: -40 }));
    };

    const vpW = viewportSize.width || 600;
    const vpH = isRound ? 320 : (viewportSize.height || 600 / aspectRatio);
    const circleDiameter = isRound ? Math.min(250, vpW - 40, vpH - 40) : 0;

    let baseScale = 1;
    let baseW = vpW;
    let baseH = vpH;

    if (naturalSize.width > 0 && naturalSize.height > 0) {
        if (isRound) {
            baseScale = Math.max(circleDiameter / naturalSize.width, circleDiameter / naturalSize.height);
        } else {
            baseScale = Math.max(vpW / naturalSize.width, vpH / naturalSize.height);
        }
        baseW = naturalSize.width * baseScale;
        baseH = naturalSize.height * baseScale;
    }

    const handleSaveCrop = async () => {
        if (!imageSrc) {
            await onSave("");
            onClose();
            return;
        }

        setIsProcessing(true);
        setErrorMessage("");

        try {
            const outW = isRound ? 400 : outputWidth;
            const outH = isRound ? 400 : Math.round(outputWidth / aspectRatio);

            const canvas = document.createElement("canvas");
            canvas.width = outW;
            canvas.height = outH;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("Could not initialize canvas context");
            }

            const img = new Image();
            img.crossOrigin = "anonymous";

            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Failed to load image for cropping"));
                img.src = imageSrc;
            });

            ctx.fillStyle = "#0f1624";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const activeFilterObj = FILTERS.find(f => f.id === selectedFilter);
            if (activeFilterObj && activeFilterObj.filter !== "none") {
                ctx.filter = activeFilterObj.filter;
            }

            const referenceFrameSize = isRound ? circleDiameter : vpW;
            const canvasScaleRatio = outW / referenceFrameSize;

            ctx.save();

            ctx.translate(canvas.width / 2, canvas.height / 2);

            ctx.translate(pan.x * canvasScaleRatio, pan.y * canvasScaleRatio);

            ctx.rotate((rotation * Math.PI) / 180);

            ctx.scale(flipH ? -1 : 1, 1);

            const targetDrawW = baseW * zoom * canvasScaleRatio;
            const targetDrawH = baseH * zoom * canvasScaleRatio;

            ctx.drawImage(img, -targetDrawW / 2, -targetDrawH / 2, targetDrawW, targetDrawH);
            ctx.restore();

            const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            await onSave(croppedDataUrl);
            setIsProcessing(false);
            onClose();
        } catch (err) {
            console.error("Cropping error:", err);

            if (imageSrc.startsWith("http")) {
                await onSave(imageSrc);
                setIsProcessing(false);
                onClose();
            } else {
                setIsProcessing(false);
                setErrorMessage("Failed to crop image. Please try uploading a local image.");
            }
        }
    };

    const handleRemoveImage = async () => {
        setIsProcessing(true);
        try {
            await onSave("");
            setIsProcessing(false);
            onClose();
        } catch (err) {
            setIsProcessing(false);
            setErrorMessage("Failed to remove cover image.");
        }
    };

    if (!isOpen) return null;

    const currentFilterCss = FILTERS.find(f => f.id === selectedFilter)?.filter || "none";

    return (
        <div className="modal-overlay crop-modal-overlay" onClick={onClose} style={{ zIndex: 3500 }}>
            <div
                className="modal-box crop-modal-container"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="crop-modal-header">
                    <div className="crop-modal-title-group">
                        <div className="crop-modal-icon">
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {isRound ? (
                                    <>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </>
                                ) : (
                                    <>
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </>
                                )}
                            </svg>
                        </div>
                        <div>
                            <h3 className="crop-modal-title">{title}</h3>
                            <p className="crop-modal-subtitle">
                                {isRound
                                    ? "Adjust and frame your photo inside the circular avatar preview"
                                    : "What you see in this frame will be your profile banner"}
                            </p>
                        </div>
                    </div>
                    <button type="button" className="crop-modal-close-btn" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {errorMessage && (
                    <div className="crop-error-banner">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="crop-tabs-bar">
                    <button
                        type="button"
                        className={`crop-tab-btn ${activeTab === "crop" || activeTab === "upload" ? "active" : ""}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Photo
                    </button>
                    {!isRound && (
                        <button
                            type="button"
                            className={`crop-tab-btn ${activeTab === "presets" ? "active" : ""}`}
                            onClick={() => setActiveTab("presets")}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a7 7 0 0 0 7 7c0 2-1 3-2 4l-1 2H8l-1-2c-1-1-2-2-2-4a7 7 0 0 0 7-7z" />
                            </svg>
                            Theme Presets
                        </button>
                    )}
                    <button
                        type="button"
                        className={`crop-tab-btn ${activeTab === "url" ? "active" : ""}`}
                        onClick={() => setActiveTab("url")}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Image Link
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </div>

                {activeTab === "url" && (
                    <form onSubmit={handleApplyUrl} className="crop-url-section">
                        <div className="crop-url-input-group">
                            <input
                                type="url"
                                placeholder="Paste image link (https://...)"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="crop-url-input"
                            />
                            <Button type="submit" variant="primary" size="sm">
                                Load Image
                            </Button>
                        </div>
                    </form>
                )}

                {!isRound && activeTab === "presets" && (
                    <div className="crop-presets-grid">
                        {PRESET_BANNERS.map((preset) => (
                            <div
                                key={preset.name}
                                className={`crop-preset-item ${imageSrc === preset.url ? "selected" : ""}`}
                                onClick={() => {
                                    setImageSrc(preset.url);
                                    setZoom(1);
                                    setPan({ x: 0, y: 0 });
                                    setActiveTab("crop");
                                }}
                            >
                                <img src={preset.url} alt={preset.name} />
                                <span className="preset-name-tag">{preset.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className={`crop-viewport-outer ${isRound ? "is-round-outer" : ""}`}>
                    <div
                        className={`crop-viewport-wrapper ${isRound ? "is-round-mode" : ""}`}
                        style={{
                            aspectRatio: isRound ? undefined : `${aspectRatio}`,
                            height: isRound ? "320px" : undefined,
                        }}
                        ref={viewportRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                    >
                        {imageSrc ? (
                            <>

                                <div
                                    className="crop-image-layer"
                                    style={{
                                        cursor: isDragging ? "grabbing" : "grab",
                                    }}
                                >
                                    <img
                                        src={imageSrc}
                                        alt="Crop target"
                                        style={{
                                            width: `${baseW}px`,
                                            height: `${baseH}px`,
                                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                                            transformOrigin: "center center",
                                            filter: currentFilterCss,
                                            position: "absolute",
                                            userSelect: "none",
                                            pointerEvents: "none",
                                        }}
                                        draggable={false}
                                    />
                                </div>

                                {isRound ? (

                                    <div className="crop-round-mask-container">
                                        <div
                                            className="crop-round-aperture"
                                            style={{
                                                width: `${circleDiameter}px`,
                                                height: `${circleDiameter}px`,
                                            }}
                                        >
                                            <div className="crop-round-inner-border" />
                                            <div className="crop-round-crosshair-h" />
                                            <div className="crop-round-crosshair-v" />
                                        </div>
                                    </div>
                                ) : (

                                    <div className="crop-guideline-overlay">
                                        <div className="grid-line grid-line-h1" />
                                        <div className="grid-line grid-line-h2" />
                                        <div className="grid-line grid-line-v1" />
                                        <div className="grid-line grid-line-v2" />
                                    </div>
                                )}

                                <div className="crop-drag-hint">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="5 9 2 12 5 15" />
                                        <polyline points="9 5 12 2 15 5" />
                                        <polyline points="15 19 12 22 9 19" />
                                        <polyline points="19 9 22 12 19 15" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <line x1="12" y1="2" x2="12" y2="22" />
                                    </svg>
                                    <span>Drag to reposition inside the {isRound ? "circle" : "frame"}</span>
                                </div>
                            </>
                        ) : (
                            <div className="crop-empty-placeholder" onClick={() => fileInputRef.current?.click()}>
                                <div className="crop-empty-icon">
                                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                                <span className="crop-empty-text">
                                    {isRound ? "Choose profile picture" : "Choose banner image"}
                                </span>
                                <span className="crop-empty-sub">JPG, PNG, WebP up to 20MB</span>
                            </div>
                        )}
                    </div>
                </div>

                {imageSrc && (
                    <div className="crop-controls-panel">

                        <div className="crop-control-row">
                            <div className="crop-zoom-group">
                                <span className="crop-control-label">Zoom</span>
                                <button
                                    type="button"
                                    className="crop-icon-btn"
                                    onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                                    title="Zoom Out"
                                >
                                    -
                                </button>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.05"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="crop-zoom-slider"
                                />
                                <button
                                    type="button"
                                    className="crop-icon-btn"
                                    onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(1))))}
                                    title="Zoom In"
                                >
                                    +
                                </button>
                                <span className="crop-zoom-value">{Math.round(zoom * 100)}%</span>
                            </div>

                            <div className="crop-transform-group">
                                <button
                                    type="button"
                                    className="crop-tool-btn"
                                    onClick={() => setRotation((r) => (r + 90) % 360)}
                                    title="Rotate 90°"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                    </svg>
                                    <span>Rotate</span>
                                </button>

                                <button
                                    type="button"
                                    className={`crop-tool-btn ${flipH ? "active" : ""}`}
                                    onClick={() => setFlipH((f) => !f)}
                                    title="Flip Horizontal"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3m8-18h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
                                        <line x1="12" y1="2" x2="12" y2="22" />
                                    </svg>
                                    <span>Flip</span>
                                </button>

                                <div className="crop-align-pills">
                                    <button type="button" onClick={() => handleAlignPosition("top")} title="Align Top">
                                        Top
                                    </button>
                                    <button type="button" onClick={() => handleAlignPosition("center")} title="Center">
                                        Center
                                    </button>
                                    <button type="button" onClick={() => handleAlignPosition("bottom")} title="Align Bottom">
                                        Bottom
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="crop-filters-row">
                            <span className="crop-control-label">Filter</span>
                            <div className="crop-filter-pills">
                                {FILTERS.map((filter) => (
                                    <button
                                        key={filter.id}
                                        type="button"
                                        className={`filter-pill ${selectedFilter === filter.id ? "active" : ""}`}
                                        onClick={() => setSelectedFilter(filter.id)}
                                    >
                                        {filter.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="crop-modal-footer">
                    {allowRemove && currentImage && (
                        <button
                            type="button"
                            className="crop-remove-btn"
                            onClick={handleRemoveImage}
                            disabled={isProcessing}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Remove Cover</span>
                        </button>
                    )}

                    <div className="crop-footer-actions">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveCrop}
                            isLoading={isProcessing}
                        >
                            {isProcessing ? "Saving & Applying..." : "Save & Apply"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
