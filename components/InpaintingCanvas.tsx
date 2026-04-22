
// "use client";

// import React, { useRef, useState, useEffect } from "react";

// interface InpaintingCanvasProps {
//   onGenerate: (image: string, mask: string, prompt: string) => void;
//   isLoading: boolean;
// }

// export default function InpaintingCanvas({ onGenerate, isLoading }: InpaintingCanvasProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [image, setImage] = useState<HTMLImageElement | null>(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [prompt, setPrompt] = useState("");
//   const [brushSize, setBrushSize] = useState(50); // Base brush size

//   // 1. Handle Image Upload
//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const img = new Image();
//     img.src = URL.createObjectURL(file);
//     img.onload = () => {
//       setImage(img);
//       setPrompt(""); // Reset prompt on new image
//     };
//   };

//   // 2. Initialize Canvas when Image Loads
//   useEffect(() => {
//     if (image && canvasRef.current && containerRef.current) {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");
      
//       // Set internal resolution to match original image High-Res
//       canvas.width = image.width;
//       canvas.height = image.height;
      
//       // Calculate dynamic brush size (approx 5% of image width)
//       setBrushSize(Math.max(image.width * 0.05, 20));

//       if (ctx) {
//         ctx.lineCap = "round";
//         ctx.lineJoin = "round";
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//       }
//     }
//   }, [image]);

//   // 3. Drawing Logic (Corrected for CSS resizing)
//   const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!canvasRef.current) return { x: 0, y: 0 };
    
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
    
//     // Handle Touch or Mouse
//     const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
//     const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

//     // Vital: Map screen pixels to Image High-Res pixels
//     const scaleX = canvas.width / rect.width;
//     const scaleY = canvas.height / rect.height;

//     return {
//       x: (clientX - rect.left) * scaleX,
//       y: (clientY - rect.top) * scaleY
//     };
//   };

//   const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
//     setIsDrawing(true);
//     const { x, y } = getMousePos(e);
    
//     const ctx = canvasRef.current?.getContext("2d");
//     if (ctx) {
//       ctx.beginPath();
//       ctx.moveTo(x, y);
//     }
//   };

//   const stopDrawing = () => {
//     setIsDrawing(false);
//     const ctx = canvasRef.current?.getContext("2d");
//     if (ctx) ctx.beginPath(); // Close path
//   };

//   const draw = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!isDrawing || !canvasRef.current) return;
//     // Prevent scrolling on touch devices
//     if ('touches' in e) {
//       // e.preventDefault(); // Uncomment if scrolling is annoying while drawing
//     }

//     const { x, y } = getMousePos(e);
//     const ctx = canvasRef.current.getContext("2d");
//     if (!ctx) return;

//     ctx.lineWidth = brushSize;
//     ctx.strokeStyle = "white"; 
//     ctx.lineTo(x, y);
//     ctx.stroke();
    
//     // Update start point for smoother lines
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//   };

//   // 4. Export Logic
//   const handleExport = () => {
//     if (!image || !canvasRef.current) return;

//     // A. Prepare Original Image
//     const tempCanvas = document.createElement("canvas");
//     tempCanvas.width = image.width;
//     tempCanvas.height = image.height;
//     const tempCtx = tempCanvas.getContext("2d");
//     tempCtx?.drawImage(image, 0, 0);
//     const imageBase64 = tempCanvas.toDataURL("image/jpeg", 0.9); // JPEG is lighter for upload

//     // B. Prepare Mask (Black BG + White Drawing)
//     const maskCanvas = document.createElement("canvas");
//     maskCanvas.width = image.width;
//     maskCanvas.height = image.height;
//     const maskCtx = maskCanvas.getContext("2d");
    
//     if (maskCtx) {
//       maskCtx.fillStyle = "black";
//       maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
//       maskCtx.drawImage(canvasRef.current, 0, 0);
//     }
//     const maskBase64 = maskCanvas.toDataURL("image/png"); // PNG required for mask precision

//     onGenerate(imageBase64, maskBase64, prompt);
//   };

//   return (
//     <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
//       {/* CONTAINER: Must shrink to fit image exactly */}
//       <div 
//         ref={containerRef} 
//         className="relative inline-block border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
//         style={{ minHeight: image ? 'auto' : '300px', minWidth: '100%' }}
//       >
//         {!image && (
//            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
//              Click below to upload
//            </div>
//         )}
        
//         {image && (
//           <>
//             {/* Layer 1: The Image (defines the size of container) */}
//             <img 
//               src={image.src} 
//               alt="Original" 
//               className="block max-w-full h-auto max-h-[60vh] mx-auto pointer-events-none select-none" 
//             />
            
//             {/* Layer 2: The Drawing Canvas (Absolute on top) */}
//             <canvas
//               ref={canvasRef}
//               onMouseDown={startDrawing}
//               onMouseUp={stopDrawing}
//               onMouseLeave={stopDrawing}
//               onMouseMove={draw}
//               onTouchStart={startDrawing}
//               onTouchEnd={stopDrawing}
//               onTouchMove={draw}
//               className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
//               style={{ opacity: 0.6 }} // Make canvas slightly see-through so you see drawing
//             />
//           </>
//         )}
//       </div>

//       <div className="flex gap-4 w-full">
//           <input 
//             type="file" 
//             accept="image/*" 
//             onChange={handleImageUpload} 
//             className="block w-full text-sm text-slate-500
//               file:mr-4 file:py-2 file:px-4
//               file:rounded-full file:border-0
//               file:text-sm file:font-semibold
//               file:bg-violet-50 file:text-violet-700
//               hover:file:bg-violet-100"
//           />
//       </div>

//       <div className="flex gap-2 w-full">
//         <input
//             type="text"
//             placeholder="Describe change (e.g. 'A persian rug')"
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             className="flex-1 p-3 border rounded shadow-sm text-black"
//         />
//         <button 
//             onClick={handleExport}
//             disabled={isLoading || !image || !prompt}
//             className="bg-black text-white px-6 py-3 rounded font-medium disabled:opacity-50 hover:bg-gray-800 transition"
//         >
//             {isLoading ? "Generating..." : "GO"}
//         </button>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useRef, useState, useEffect } from "react";

interface InpaintingCanvasProps {
  onGenerate: (image: string, mask: string, prompt: string) => void;
  isLoading: boolean;
}

export default function InpaintingCanvas({ onGenerate, isLoading }: InpaintingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [brushSize, setBrushSize] = useState(20);
  const [showMaskDebug, setShowMaskDebug] = useState(false);

  // 1. Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setPrompt("");
      // Clear canvas logic will run in useEffect
    };
    reader.readAsDataURL(file);
  };

  // 2. Sync Canvas Size to Image Size (The Alignment Fix)
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !imageSrc) return;

    const resizeCanvas = () => {
      // We make the canvas resolution match the DISPLAYED image size
      // This ensures 1:1 coordination between cursor and ink
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Clear and setup context
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Initial sizing
    if (img.complete) resizeCanvas();
    else img.onload = resizeCanvas;

    // Watch for browser window resizing
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(img);

    return () => observer.disconnect();
  }, [imageSrc]);

  // 3. Drawing Logic
  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getMousePos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    // e.preventDefault(); // Uncomment if drawing on mobile drags page
    
    const { x, y } = getMousePos(e);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // Semi-transparent white while drawing
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // 4. Export Logic (Scales up to original resolution)
  const handleExport = () => {
    if (!imgRef.current || !canvasRef.current) return;
    
    const displayImg = imgRef.current;
    const displayCanvas = canvasRef.current;

    // Create High-Res Output Canvas (Size of ORIGINAL image file)
    const naturalWidth = displayImg.naturalWidth;
    const naturalHeight = displayImg.naturalHeight;

    // A. Prepare Original Image High Res
    const tempImgCanvas = document.createElement("canvas");
    tempImgCanvas.width = naturalWidth;
    tempImgCanvas.height = naturalHeight;
    const tempImgCtx = tempImgCanvas.getContext("2d");
    tempImgCtx?.drawImage(displayImg, 0, 0);
    const imageBase64 = tempImgCanvas.toDataURL("image/jpeg", 0.95);

    // B. Prepare Mask High Res
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = naturalWidth;
    maskCanvas.height = naturalHeight;
    const maskCtx = maskCanvas.getContext("2d");

    if (maskCtx) {
      // 1. Black Background
      maskCtx.fillStyle = "black";
      maskCtx.fillRect(0, 0, naturalWidth, naturalHeight);
      
      // 2. Draw the Display Canvas (scaled up)
      // We turn off smoothing to keep sharp edges on the mask
      maskCtx.imageSmoothingEnabled = false;
      maskCtx.fillStyle = "white";
      
      // We can't just drawImage(canvas) because the strokes might be transparent-ish
      // We need to force them to be SOLID WHITE.
      // Best way: Draw the display canvas, then use composite operation to turn non-black to white?
      // Easier way: Just trust the drawImage, but ensure drawing opacity was high.
      
      maskCtx.drawImage(displayCanvas, 0, 0, naturalWidth, naturalHeight);
      
      // Force all non-black pixels to be pure white (Fixes transparency issues)
      const imageData = maskCtx.getImageData(0, 0, naturalWidth, naturalHeight);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
          // If pixel has any brightness, make it full white
          if (data[i] > 20 || data[i+1] > 20 || data[i+2] > 20) {
              data[i] = 255;     // R
              data[i+1] = 255;   // G
              data[i+2] = 255;   // B
              data[i+3] = 255;   // Alpha
          }
      }
      maskCtx.putImageData(imageData, 0, 0);
    }

    const maskBase64 = maskCanvas.toDataURL("image/png");

    onGenerate(imageBase64, maskBase64, prompt);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto">
      {/* IMAGE STACK */}
      <div className="relative w-full border rounded-lg overflow-hidden bg-gray-100 shadow-sm">
        {!imageSrc && <div className="h-64 flex items-center justify-center text-gray-400">Upload an image</div>}
        
        {/* The Image (Master of Size) */}
        {imageSrc && (
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt="Workplace" 
            className="block w-full h-auto" // 'block' removes ghost space
          />
        )}

        {/* The Canvas (Locked to Image) */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className={`absolute top-0 left-0 w-full h-full cursor-crosshair touch-none ${showMaskDebug ? 'opacity-100 bg-black' : 'opacity-70'}`}
          // If Debug Mode is ON, we show the canvas clearly against black to verify strokes
        />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col gap-3 w-full">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm"/>
        
        <div className="flex items-center gap-4">
            <label className="text-sm font-semibold flex items-center gap-2">
                Brush Size:
                <input 
                    type="range" min="5" max="100" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                />
            </label>
            
            <button 
                onClick={() => {
                    setShowMaskDebug(!showMaskDebug);
                    // If verifying, fill background with black temporarily
                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext("2d");
                    if(canvas && ctx && !showMaskDebug) {
                        // Visual check helper (non-destructive to data, just visual)
                        canvas.style.backgroundColor = "rgba(0,0,0,0.5)";
                    } else if (canvas) {
                        canvas.style.backgroundColor = "transparent";
                    }
                }}
                className="text-xs bg-gray-200 px-2 py-1 rounded border hover:bg-gray-300"
            >
                {showMaskDebug ? "Hide Mask Check" : "👀 Check Mask Alignment"}
            </button>
        </div>

        <div className="flex gap-2">
            <input
                type="text"
                placeholder="Prompt (e.g. 'A persian rug')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 p-3 border rounded text-black"
            />
            <button 
                onClick={handleExport}
                disabled={isLoading || !imageSrc || !prompt}
                className="bg-black text-white px-6 rounded font-bold disabled:opacity-50"
            >
                {isLoading ? "..." : "GO"}
            </button>
        </div>
      </div>
    </div>
  );
}