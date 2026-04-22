// // import { ImagePlayground } from "@/components/ImagePlayground";
// // import { getRandomSuggestions } from "@/lib/suggestions";

// // export const dynamic = "force-dynamic";

// // export default function Page() {
// //   return <ImagePlayground suggestions={getRandomSuggestions()} />;
// // }

// "use client";

// import { useState } from "react";

// export default function ImagePlayground() {
//   const [image, setImage] = useState<string | null>(null);
//   const [prompt, setPrompt] = useState("");
//   const [result, setResult] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
    
//     const reader = new FileReader();
//     reader.onload = () => setImage(reader.result as string);
//     reader.readAsDataURL(file);
//   };

//   const generate = async () => {
//     if (!image || !prompt) return;
//     setLoading(true);
//     setResult(null);

//     const res = await fetch("/api/inpaint", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ image, prompt })
//     });

//     const data = await res.json();
//     setResult(data.output);
//     setLoading(false);
//   };

//   return (
//     <div className="p-6 space-y-4 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold">Room Redesign Playground</h1>

//       <input type="file" accept="image/*" onChange={handleImageUpload} />

//       {image && (
//         <img src={image} alt="Uploaded" className="w-full rounded-lg shadow" />
//       )}

//       <textarea
//         className="w-full p-3 border rounded-lg"
//         placeholder="Describe changes (e.g., add a grey sofa and Persian rug)"
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//       />

//       <button
//         onClick={generate}
//         disabled={loading}
//         className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
//       >
//         {loading ? "Processing..." : "Generate"}
//       </button>

//       {result && (
//         <div>
//           <h2 className="font-semibold mt-4">Output:</h2>
//           <img src={result} alt="AI Result" className="w-full rounded-lg shadow" />
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
// 👇 adjust this path to match where you saved the file!
import InpaintingCanvas from "@/components/InpaintingCanvas"; 

export default function ImagePlayground() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // This function receives the data from the child component
  const handleGenerate = async (image: string, mask: string, prompt: string) => {
    setLoading(true);
    setResult(null);

    try {
      console.log("Sending request to API...");
      
      const res = await fetch("/api/inpaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🚀 NOW WE SEND ALL 3: Image, Mask, and Prompt
        body: JSON.stringify({ image, mask, prompt }), 
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server error:", errorText);
        alert(`Server error: ${errorText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      
      if (data.output) {
        setResult(data.output);
      } else {
        console.error("No output in response", data);
        alert("AI finished but returned no image.");
      }
      
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Room Redesign Playground</h1>
        <p className="text-gray-600">
          Upload a photo, <span className="font-bold text-blue-600">draw over the area you want to change</span>, and describe the new look.
        </p>
      </div>

      {/* 👇 The new component handles Upload, Drawing, and Prompting */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <InpaintingCanvas onGenerate={handleGenerate} isLoading={loading} />
      </div>

      {/* 👇 Result Display */}
      {result && (
        <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
          <h2 className="font-semibold text-xl mb-4 text-center text-green-800">✨ Redesigned Result:</h2>
          <div className="flex justify-center">
            <img 
              src={result} 
              alt="AI Result" 
              className="max-w-full max-h-[600px] rounded-lg shadow-lg border-4 border-white" 
            />
          </div>
        </div>
      )}
    </div>
  );
}


// "use client";

// import { useState } from "react";

// export default function ImagePlayground() {
//   const [image, setImage] = useState<string | null>(null);
//   const [prompt, setPrompt] = useState("");
//   const [result, setResult] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
    
//     const reader = new FileReader();
//     reader.onload = () => setImage(reader.result as string);
//     reader.readAsDataURL(file);
//   };

//   const generate = async () => {
//     if (!image || !prompt) return;
//     setLoading(true);
//     setResult(null);

//     const res = await fetch("/api/inpaint", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ image, prompt })
//     });

//     // 🔥 If backend fails, prevent JSON error
//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error("❌ Server error:", errorText);
//       setLoading(false);
//       alert("Server error: Check API route logs.");
//       return;
//     }

//     const data = await res.json();
//     setResult(data.output);
//     setLoading(false);
//   };

//   return (
//     <div className="p-6 space-y-4 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold">Room Redesign Playground</h1>

//       <input type="file" accept="image/*" onChange={handleImageUpload} />

//       {image && (
//         <img src={image} alt="Uploaded" className="w-full rounded-lg shadow" />
//       )}

//       <textarea
//         className="w-full p-3 border rounded-lg"
//         placeholder="Describe changes (e.g., add a grey sofa and Persian rug)"
//         value={prompt}
//         onChange={(e) => setPrompt(e.target.value)}
//       />

//       <button
//         onClick={generate}
//         disabled={loading}
//         className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
//       >
//         {loading ? "Processing..." : "Generate"}
//       </button>

//       {result && (
//         <div>
//           <h2 className="font-semibold mt-4">Output:</h2>
//           <img src={result} alt="AI Result" className="w-full rounded-lg shadow" />
//         </div>
//       )}
//     </div>
//   );
// }
