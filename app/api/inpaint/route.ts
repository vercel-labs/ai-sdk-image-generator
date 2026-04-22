

// import { NextRequest, NextResponse } from "next/server";
// import Replicate from "replicate";
// import fs from "fs";
// import path from "path";

// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN,
// });

// export async function POST(req: NextRequest) {
//   try {
//     console.log("--- INPAINT REQUEST RECEIVED ---");
    
//     // 1. Parse Body
//     const body = await req.json();
//     const { image, prompt, mask } = body;

//     // 2. Debug Logs
//     console.log(`Prompt received: "${prompt}"`);
    
//     if (!image) console.error("❌ ERROR: Image is missing!");
//     else console.log(`✅ Image received. Length: ${image.length} chars`);

//     if (!mask) {
//       console.error("❌ ERROR: Mask is missing!");
//       return NextResponse.json({ error: "Mask is missing" }, { status: 400 });
//     } else {
//       console.log(`✅ Mask received. Length: ${mask.length} chars`);
//     }

//     // 3. 🔥 SAVE MASK TO FILE (CRITICAL DEBUGGING)
//     // This saves 'debug-mask.png' to your project root. 
//     // OPEN THIS FILE. If it is all black, your Frontend is broken.
//     try {
//         const base64Data = mask.replace(/^data:image\/\w+;base64,/, "");
//         const buffer = Buffer.from(base64Data, 'base64');
//         const filePath = path.join(process.cwd(), 'debug-mask.png');
//         fs.writeFileSync(filePath, buffer);
//         console.log(`📸 DEBUG: Saved mask to ${filePath} -> CHECK THIS IMAGE!`);
//     } catch (err) {
//         console.error("Could not save debug file (ignore if on Vercel):", err);
//     }

//     console.log("🚀 Sending to Replicate (Flux Fill)...");

//     // 4. Run Model
//     const output: any = await replicate.run(
//       "black-forest-labs/flux-fill-dev",
//       {
//         input: {
//           image: image,
//           mask: mask, 
//           prompt: prompt,
//           guidance: 50, // Increased guidance to FORCE changes
//           output_format: "jpg",
//           safety_tolerance: 2
//         },
//       }
//     );

//     console.log("✅ Replicate finished. Processing output...");

//     let imageUrl = output;
//     if (Array.isArray(output)) imageUrl = output[0];

//     // 5. Handle Stream
//     if (imageUrl && typeof imageUrl === 'object' && 'getReader' in imageUrl) {
//         console.log("🔄 Output is a Stream. Converting...");
//         const response = new Response(imageUrl);
//         const blob = await response.blob();
//         const arrayBuffer = await blob.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         imageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
//         console.log("✨ Conversion complete.");
//     }

//     return NextResponse.json({ output: imageUrl });

//   } catch (error: any) {
//     console.error("❌ INPAINTING ERROR:", error);
//     return NextResponse.json(
//       { error: error.message || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
// 👇 IMPORT YOUR EXISTING RAG FILES
import { generateEmbedding } from "@/lib/embeddings";
import { searchProducts } from "@/lib/qdrant"; 

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { image, mask, prompt, structure } = await req.json();

    console.log("🎨 Starting Inpaint with RAG...");
    console.log("User Prompt:", prompt);

    let finalPrompt = prompt;
    let productUsed = null;

    // ============================================================
    // 1. 🧠 THE RAG STEP (Semantic Search)
    // ============================================================
    try {
      // A. Generate Embedding for the user's prompt
      // This turns "I want a cozy seat" into numbers: [0.12, -0.4, ...]
      const embedding = await generateEmbedding(prompt);
      
      // B. Search Qdrant
      // We only need the top #1 best match
      const searchResults = await searchProducts(embedding, 1);

      if (searchResults && searchResults.length > 0) {
        const match = searchResults[0];

        // Filter: Ensure the match is actually relevant (score > 0.7 is a safe bet)
        // If your Qdrant scores are low, lower this number.
        if (match.score && match.score > 0.70) {
            console.log(`✅ RAG Match Found: ${match.name} (Score: ${match.score})`);
            
            productUsed = match;

            // C. CONSTRUCT THE "PERFECT" PROMPT
            // We combine specific details from your DB to guide the AI
            // Ensure your product object has these fields!
            finalPrompt = `
              ${match.name}, 
              ${match.description || ""}, 
              ${match.material ? match.material + " material" : ""}, 
              ${match.color ? match.color + " color" : ""}, 
              photorealistic, 4k, interior design magazine style, high quality, realistic lighting
            `.replace(/\s+/g, " ").trim();
        } else {
            console.log("⚠️ Match found but score too low. Using raw user prompt.");
        }
      } else {
        console.log("⚠️ No products found in Qdrant.");
      }
    } catch (ragError) {
      console.error("❌ RAG System Error:", ragError);
      // We don't stop the process; we just fall back to the user's raw prompt
    }

    console.log("📝 Final Prompt sent to AI:", finalPrompt);

    // ============================================================
    // 2. 🎨 THE GENERATION STEP (Flux Fill)
    // ============================================================
    const output: any = await replicate.run(
      "black-forest-labs/flux-fill-dev",
      {
        input: {
          image: image,
          mask: mask,
          prompt: finalPrompt, // The Enhanced RAG Prompt
          guidance: structure === "replace" ? 50 : 30,
          output_format: "jpg",
          safety_tolerance: 2,
        },
      }
    );

    // Handle Output (Stream vs String)
    let imageUrl = output;
    if (Array.isArray(output)) imageUrl = output[0];
    
    if (imageUrl && typeof imageUrl === 'object' && 'getReader' in imageUrl) {
        const response = new Response(imageUrl);
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        imageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }

    // ============================================================
    // 3. 📦 RETURN RESULT + PRODUCT INFO
    // ============================================================
    return NextResponse.json({ 
      output: imageUrl,
      // We return the product so the Frontend can show the "Buy" card
      matchedProduct: productUsed 
    });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}