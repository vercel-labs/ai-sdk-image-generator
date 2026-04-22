


// import { useState } from "react";
// import { Suggestion } from "@/lib/suggestions";

// interface ImagePlaygroundProps {
//   suggestions: Suggestion[];
//   enableInpainting?: boolean;
// }

// export default function ImagePlayground({
//   suggestions,
//   enableInpainting = false,
// }: ImagePlaygroundProps) {
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
//     if (!prompt) return;
//     setLoading(true);
//     setResult(null);

//     const res = await fetch("/api/inpaint", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         image,
//         prompt,
//         mode: enableInpainting ? "inpaint" : "generate",
//       }),
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
