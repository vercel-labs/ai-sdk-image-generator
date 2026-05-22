<a href="https://ai-sdk-image-generator.vercel.app">
  <img alt="Next.js 15 and App Router AI SDK YouTube Thumbnail Generator." src="https://ai-sdk-image-generator.vercel.app/opengraph-image.png">
  <h1 align="center">AI YouTube Thumbnail Generator</h1>
</a>

<p align="center">
  An open-source AI thumbnail generation app built with Next.js 15, the AI SDK by Vercel, and multiple AI providers — generate and compare professional YouTube thumbnails side-by-side in seconds.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#architecture-overview"><strong>Architecture</strong></a> ·
  <a href="#api-reference"><strong>API Reference</strong></a> ·
  <a href="#project-structure"><strong>Project Structure</strong></a> ·
  <a href="#configuration"><strong>Configuration</strong></a> ·
  <a href="#adding-providers-or-models"><strong>Extending</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>

<br/>

---

## Features

- **Multi-provider image generation** — sends your prompt to all four AI providers simultaneously and displays the results side-by-side for easy comparison.
- **AI SDK `generateImage`** — uses [`experimental_generateImage`](https://sdk.vercel.ai/docs/reference/ai-sdk-core/generate-image) from the [Vercel AI SDK](https://sdk.vercel.ai/docs), making it trivial to swap or add providers with a single line of code.
- **Structured thumbnail form** — fill in a _Title_, _Subject_, _Style Preset_, _Emotion Preset_, and optional _Overlay Text_; the app assembles a provider-optimised prompt for each provider automatically.
- **YouTube URL entry point** — paste any YouTube video URL and the app fetches the title and thumbnail via the public oEmbed API (no API key required), then pre-fills the form so you can tweak and regenerate.
- **AI title inference** — type (or paste) a video title and let GPT-4o-mini suggest the best subject, style, emotion, and overlay text for a high-CTR thumbnail.
- **Image-to-image (img2img) support** — upload a selfie or reference image to condition generation on Replicate and Fireworks models.
- **Performance / Quality mode toggle** — switch between fast, cheaper models and higher-quality, slower models with a single click.
- **Per-provider model picker** — override the default model for any provider from a curated, capability-annotated list.
- **Retry failed providers** — if one provider errors out, a retry button appears on that card without rerunning the others.
- **Per-provider timing display** — each result card shows how long that provider took.
- **Responsive layout** — a carousel on mobile, a 2–4 column grid on larger screens.
- **shadcn/ui + Tailwind CSS** — clean, accessible component library.
- **Next.js App Router (v15)** — server components, route handlers, and edge-compatible image SDK.

---

## Model Providers

| Provider | Default (Performance) | Default (Quality) | img2img |
|---|---|---|---|
| **Replicate** | `stability-ai/stable-diffusion-3.5-large-turbo` | `stability-ai/stable-diffusion-3.5-large` | ✅ FLUX & SD 3.5 models |
| **Google Vertex AI** | `imagen-3.0-fast-generate-001` | `imagen-3.0-generate-001` | ❌ |
| **OpenAI** | `dall-e-2` | `dall-e-3` | ❌ |
| **Fireworks** | `accounts/fireworks/models/flux-1-schnell-fp8` | `accounts/fireworks/models/flux-1-dev-fp8` | ✅ FLUX models |

Each provider exposes a curated list of models in `lib/provider-config.ts`. You can select any model from the UI per-provider, or change the defaults in code.

---

## Architecture Overview

```
Browser
  └── ImagePlayground (client component)
        ├── InputRouter      ← YouTube URL / title inference / image upload entry points
        ├── ThumbnailForm    ← structured form → buildPrompt() → fires API calls
        └── ModelSelect / ModelCardCarousel  ← displays results per-provider

Next.js API Routes (server)
  ├── POST /api/generate-images   ← calls AI SDK generateImage for a single provider
  ├── POST /api/infer-from-title  ← calls GPT-4o-mini (structured output) to suggest form fields
  └── GET  /api/youtube-metadata  ← fetches title & thumbnail via YouTube oEmbed (no API key)
```

### Data flow for a typical generation

1. User fills in **Title** + **Subject** (and optionally style, emotion, overlay text).
2. `ThumbnailForm` calls `buildPrompt()` which assembles a provider-specific prompt string.
3. The prompt is handed to `useImageGeneration` hook.
4. The hook fires one `POST /api/generate-images` request **per enabled provider** in parallel.
5. Each API route call:
   - Validates the request.
   - Selects the correct AI SDK image model factory for the provider.
   - Builds dimension parameters (`size` vs `aspectRatio`) per provider's requirements.
   - Optionally attaches a reference image for img2img-capable providers.
   - Calls `experimental_generateImage` with a 55-second timeout.
   - Returns `{ image: base64 }` or `{ error: string }`.
6. As each response arrives the corresponding provider card updates with the image or an error/retry state.

---

## API Reference

### `POST /api/generate-images`

Generates a single image using the specified provider and model.

**Request body** (`application/json`):

| Field | Type | Required | Description |
|---|---|---|---|
| `prompt` | `string` | ✅ | The image generation prompt. |
| `provider` | `"replicate" \| "vertex" \| "openai" \| "fireworks"` | ✅ | Which AI provider to use. |
| `modelId` | `string` | ✅ | Provider-specific model identifier. |
| `aspectRatio` | `"1:1" \| "16:9"` | ❌ | Defaults to `"16:9"`. |
| `referenceImage` | `string` (base64 data URL) | ❌ | Optional reference image for img2img. |
| `referenceMode` | `"face" \| "style"` | ❌ | How the reference image influences generation. Required when `referenceImage` is set. |

**Success response** (`200`):

```json
{ "image": "<base64-encoded PNG>" }
```

**Error response** (`400` / `500`):

```json
{ "error": "<user-friendly message>" }
```

**Notes:**
- Requests time out after **55 seconds** to stay inside serverless function limits.
- A random seed is applied to all providers except OpenAI (DALL-E models don't accept seeds via the AI SDK interface).
- Vertex AI watermarking is disabled via `providerOptions`.
- img2img is forwarded as `image` (Replicate) or `init_image` + `image_strength: 0.6` (Fireworks). OpenAI and Vertex ignore reference images in this release.

---

### `POST /api/infer-from-title`

Uses **GPT-4o-mini** (Vercel AI SDK structured output) to infer thumbnail form fields from a YouTube video title. Results are cached in-memory (per serverless instance) with an LRU policy (max 500 entries, keyed by SHA-256 of the normalised title).

**Request body**:

```json
{ "title": "I Built a Swimming Pool in My Backyard" }
```

**Success response** (`200`):

```json
{
  "subject": "person standing proudly next to a finished backyard pool",
  "stylePreset": "MrBeast/high-energy",
  "emotionPreset": "excited",
  "overlayText": "IT'S FINALLY DONE",
  "rationale": "High-energy style matches the ambitious DIY achievement; excitement drives clicks.",
  "cached": false
}
```

**Error responses**:

| Status | When |
|---|---|
| `400` | Empty title or title longer than 300 characters. |
| `500` | LLM call failed (e.g. missing `OPENAI_API_KEY`). |

---

### `GET /api/youtube-metadata?url=<youtubeUrl>`

Fetches video title, channel name, and thumbnail URL via the **YouTube oEmbed endpoint** (no API key required). Responses are cached at the CDN/browser level for 1 hour (`Cache-Control: public, max-age=3600, stale-while-revalidate=86400`).

**Query parameter**: `url` — any valid YouTube video URL (`watch`, `youtu.be`, `shorts`, `embed`, mobile).

**Success response** (`200`):

```json
{
  "title": "Building a PC in 2024",
  "authorName": "Linus Tech Tips",
  "thumbnailUrl": "https://i.ytimg.com/vi/<videoId>/maxresdefault.jpg",
  "videoId": "dQw4w9WgXcQ"
}
```

**Error responses**:

| Status | When |
|---|---|
| `400` | URL is missing, blank, or not a recognisable YouTube URL. |
| `502` | YouTube's oEmbed endpoint returned an unexpected error. |

---

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── generate-images/route.ts   # Image generation route handler
│   │   ├── infer-from-title/route.ts  # AI title-inference route handler
│   │   └── youtube-metadata/route.ts  # YouTube oEmbed proxy
│   ├── layout.tsx                     # Root layout with fonts & analytics
│   ├── page.tsx                       # Entry page — renders ImagePlayground
│   └── globals.css
├── components/
│   ├── ImagePlayground.tsx            # Top-level orchestrator (client component)
│   ├── ThumbnailForm.tsx              # Structured form: title, subject, presets
│   ├── InputRouter.tsx                # Tab-switcher for entry points (YouTube, title, image upload)
│   ├── ModelSelect.tsx                # Single provider card (image + model picker)
│   ├── ModelCardCarousel.tsx          # Mobile carousel wrapper around ModelSelect cards
│   ├── ImageDisplay.tsx               # Image preview with download / zoom
│   ├── ImageCarousel.tsx              # Multi-image carousel
│   ├── ImageGenerator.tsx             # Prompt-input generation panel (standalone mode)
│   ├── ImageSkeleton.tsx              # Loading skeleton for image cards
│   ├── ImageUploader.tsx              # Reference-image upload widget
│   ├── PromptInput.tsx                # Free-text prompt input (used outside ThumbnailForm)
│   ├── PromptSuggestions.tsx          # Clickable suggestion chips
│   ├── QualityModeToggle.tsx          # Performance / Quality mode toggle button
│   ├── Stopwatch.tsx                  # Per-provider elapsed-time display
│   ├── TitleInferenceInput.tsx        # Title-inference entry-point panel
│   ├── YouTubeUrlInput.tsx            # YouTube URL entry-point panel
│   ├── Header.tsx                     # App header with logo and links
│   └── ui/                            # shadcn/ui primitive components
├── hooks/
│   ├── use-image-generation.ts        # Core hook: fires parallel API calls, tracks state
│   └── use-toast.ts                   # Toast notification hook
├── lib/
│   ├── provider-config.ts             # Provider/model registry with capability flags
│   ├── api-types.ts                   # Shared TypeScript types for API request/response
│   ├── image-types.ts                 # Types for image results, errors, and timings
│   ├── prompt-builder.ts              # Builds provider-optimised prompts from form values
│   ├── title-inference.ts             # GPT-4o-mini structured-output inference + LRU cache
│   ├── youtube-fetcher.ts             # YouTube oEmbed fetcher + URL parsing utilities
│   ├── suggestions.ts                 # Curated YouTube thumbnail suggestion templates
│   ├── image-helpers.ts               # Shared image utility helpers
│   ├── logos.tsx                      # Provider logo SVG components
│   └── utils.ts                       # General utilities (cn, etc.)
├── scripts/                           # Utility / maintenance scripts
├── public/
│   └── provider-icons/               # SVG icons for Replicate, Vertex, OpenAI, Fireworks
├── .env.example                       # Template for required environment variables
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Configuration

### Environment variables

Copy `.env.example` to `.env.local` and fill in the keys for every provider you want to enable. You can omit keys for providers you don't need — those provider cards will show an error at generation time.

```bash
cp .env.example .env.local
```

| Variable | Provider | How to obtain |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `REPLICATE_API_TOKEN` | Replicate | [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) |
| `FIREWORKS_API_KEY` | Fireworks | [fireworks.ai/account/api-keys](https://fireworks.ai/account/api-keys) |
| `GOOGLE_CLIENT_EMAIL` | Google Vertex AI | Service account JSON → `client_email` |
| `GOOGLE_PRIVATE_KEY` | Google Vertex AI | Service account JSON → `private_key` |
| `GOOGLE_VERTEX_PROJECT` | Google Vertex AI | Your Google Cloud project ID |
| `GOOGLE_VERTEX_LOCATION` | Google Vertex AI | Region, e.g. `us-central1` |

> **Note:** `OPENAI_API_KEY` is also required for the `/api/infer-from-title` endpoint (GPT-4o-mini) regardless of whether you enable OpenAI image generation.

#### Google Vertex AI setup

1. In the [Google Cloud Console](https://console.cloud.google.com/) create (or select) a project and enable the **Vertex AI API**.
2. Create a **service account** with the `Vertex AI User` role.
3. Generate a JSON key for that service account.
4. Copy `client_email` → `GOOGLE_CLIENT_EMAIL` and `private_key` → `GOOGLE_PRIVATE_KEY` from the JSON file.
5. Set `GOOGLE_VERTEX_PROJECT` to your project ID and `GOOGLE_VERTEX_LOCATION` to your preferred region (e.g. `us-central1`).

For more details see the [AI SDK Google Vertex documentation](https://sdk.vercel.ai/providers/ai-sdk-providers/google-vertex#edge-runtime).

---

## Adding Providers or Models

### Adding a new model to an existing provider

Open `lib/provider-config.ts` and add an entry to the `modelConfigs` array for the relevant provider:

```ts
// Example: add a new Replicate model
replicate: buildProvider({
  // ...
  modelConfigs: [
    { id: "black-forest-labs/flux-1.1-pro", img2img: true },
    { id: "your-org/your-new-model",         img2img: false }, // ← add here
  ],
}),
```

Set `img2img: true` only if the model accepts a base64 `image` input for conditioning.

To make a new model the default for performance or quality mode, update `MODEL_CONFIGS` in the same file:

```ts
export const MODEL_CONFIGS: Record<ModelMode, Record<ProviderKey, string>> = {
  performance: {
    replicate: "your-org/your-new-model", // ← override here
    // ...
  },
};
```

### Adding a brand-new provider

1. **Install the AI SDK provider package:**
   ```bash
   npm install @ai-sdk/your-provider
   ```

2. **Register it in `lib/provider-config.ts`:**
   - Add a new key to `ProviderKey`.
   - Add a `buildProvider(...)` entry to `PROVIDERS`.
   - Add performance/quality defaults to `MODEL_CONFIGS`.
   - Append the key to `PROVIDER_ORDER`.

3. **Wire up the image model factory in `app/api/generate-images/route.ts`:**
   ```ts
   import { yourProvider } from "@ai-sdk/your-provider";

   const providerConfig: Record<ProviderKey, ProviderConfig> = {
     // ...
     yourProvider: {
       createImageModel: yourProvider.image,
       dimensionFormat: "aspectRatio", // or "size"
     },
   };
   ```

4. **Add an icon** to `public/provider-icons/<name>.svg` and reference the path in `lib/provider-config.ts`.

5. **Add the API key** to `.env.example` and `.env.local`.

---

## Key Library Modules

### `lib/provider-config.ts`

Central registry for all providers and models.

- **`PROVIDERS`** — display name, icon, brand colour, and `modelConfigs` (with `img2img` flag) for each provider.
- **`MODEL_CONFIGS`** — default model ID per provider per `ModelMode` (`"performance"` | `"quality"`).
- **`PROVIDER_ORDER`** — canonical render order used throughout the UI.
- **`supportsImg2Img(provider, modelId)`** — returns `true` if the model is flagged for img2img in the registry.
- **`initializeProviderRecord<T>(defaultValue?)`** — helper that creates a `Record<ProviderKey, T>` pre-populated with a default value, useful for initialising React state.

### `lib/prompt-builder.ts`

```ts
buildPrompt(request: PromptRequest, provider: string): string
```

Accepts structured form values (`title`, `subject`, `stylePreset`, `emotionPreset`) and returns a prompt string tailored to each provider's strengths:

| Provider | Strategy |
|---|---|
| `openai` | Descriptive, imaginative — "A YouTube thumbnail showing: …. High contrast, vibrant colors." |
| `replicate` | Detail-forward FLUX style — "professional YouTube thumbnail: …. Bold text, clear focal point." |
| `vertex` | Natural language — "Create a YouTube thumbnail featuring …." |
| `fireworks` | Trend-aware — "YouTube thumbnail style: …. Trending on YouTube, clickbait worthy." |

### `lib/title-inference.ts`

Server-side function `inferFromTitle(title)` that calls GPT-4o-mini with a Zod schema to get structured thumbnail suggestions. Includes an in-memory LRU cache (max 500 entries) keyed by SHA-256 of the normalised title to avoid redundant LLM calls.

### `lib/youtube-fetcher.ts`

Server-side utilities for YouTube URL handling:

- **`extractVideoId(url)`** — extracts the 11-character video ID from any common YouTube URL format (watch, youtu.be, shorts, embed, mobile).
- **`getThumbnailUrl(videoId, quality?)`** — builds a `i.ytimg.com` thumbnail URL (defaults to `maxresdefault`).
- **`fetchYouTubeMetadata(url)`** — calls the oEmbed endpoint and returns a typed result/error discriminated union.

### `hooks/use-image-generation.ts`

React hook that orchestrates parallel image generation across all active providers.

```ts
const {
  images,          // ImageResult[]  — one entry per provider (image: string | null)
  errors,          // ImageError[]   — provider + message for each failure
  timings,         // Record<ProviderKey, ProviderTiming>
  failedProviders, // ProviderKey[]
  isLoading,       // boolean
  activePrompt,    // string         — the last submitted prompt
  startGeneration, // (prompt, providers, providerToModel, aspectRatio?, referenceImage?) => Promise<void>
  resetState,      // () => void
} = useImageGeneration();
```

`startGeneration` fires one `fetch` call per provider in parallel using `Promise.all`. Each call updates its slice of state independently as responses arrive, so images appear as they complete rather than waiting for the slowest provider.

---

## Deploy Your Own

Deploy to Vercel in one click — the button below will clone the repository and prompt you for all required environment variables:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-image-generator&env=FIREWORKS_API_KEY,GOOGLE_CLIENT_EMAIL,GOOGLE_PRIVATE_KEY,GOOGLE_VERTEX_LOCATION,GOOGLE_VERTEX_PROJECT,OPENAI_API_KEY,REPLICATE_API_TOKEN&envDescription=AI%20Provider%20API%20keys%20required%20for%20this%20demo.&envLink=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-image-generator&demo-title=AI%20SDK%20Image%20Generator&demo-description=%20%20An%20open-source%20AI%20image%20generation%20app%20template%20built%20with%20Next.js%2C%20the%20AI%20SDK%20by%20Vercel%2C%20and%20various%20AI%20providers%20(Replicate%2C%20Fireworks%2C%20Google%20Vertex%20AI%2C%20OpenAI).&demo-url=https%3A%2F%2Fai-sdk-image-generator.vercel.app%2F&demo-image=https%3A%2F%2Fai-sdk-image-generator.vercel.app%2Fopengraph-image.png)

> **Tip:** You can safely omit provider keys you don't need — just be aware that those provider cards will display an error when generation is attempted.

---

## Running Locally

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm
- API keys for at least one provider (see [Environment variables](#environment-variables))

### Steps

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/vercel-labs/ai-sdk-image-generator.git
   cd ai-sdk-image-generator
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and fill in the keys for the providers you plan to use:
   ```
   # Standard API keys
   OPENAI_API_KEY=sk-...
   REPLICATE_API_TOKEN=r8_...
   FIREWORKS_API_KEY=fw_...

   # Google Vertex AI settings
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_VERTEX_PROJECT=your-gcp-project-id
   GOOGLE_VERTEX_LOCATION=us-central1
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000).

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server (after build) |
| `npm run lint` | Run ESLint |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| AI / LLM | [Vercel AI SDK 4](https://sdk.vercel.ai) (`ai`, `@ai-sdk/*`) |
| Image providers | Replicate, Google Vertex AI, OpenAI, Fireworks |
| UI components | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Carousel | [Embla Carousel](https://www.embla-carousel.com) |
| Validation | [Zod](https://zod.dev) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |

---

## Authors

This repository is maintained by the [Vercel](https://vercel.com) team and community contributors. Special thanks to:

- Walter Korman ([@shaper](https://x.com/shaper)) — [Vercel](https://vercel.com)
- Nico Albanese ([@nicoalbanese10](https://x.com/nicoalbanese10)) — [Vercel](https://vercel.com)

Contributions are welcome! Feel free to open issues or submit pull requests to enhance functionality or fix bugs.
