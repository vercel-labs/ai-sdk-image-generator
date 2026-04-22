// export type ProviderKey = "replicate";
// export type ModelMode = "performance" | "quality";

// export const PROVIDERS: Record<
//   ProviderKey,
//   {
//     displayName: string;
//     iconPath: string;
//     color: string;
//     models: string[];
//   }
// > = {
//   replicate: {
//     displayName: "Replicate",
//     iconPath: "/provider-icons/replicate.svg",
//     color: "from-purple-500 to-blue-500",
//     models: [
//       "black-forest-labs/flux-1.1-pro",
//       "black-forest-labs/flux-1.1-pro-ultra",
//       "black-forest-labs/flux-dev",
//       "black-forest-labs/flux-pro",
//       "black-forest-labs/flux-schnell",
//       "ideogram-ai/ideogram-v2",
//       "ideogram-ai/ideogram-v2-turbo",
//       "luma/photon",
//       "luma/photon-flash",
//       "recraft-ai/recraft-v3",
//       "stability-ai/stable-diffusion-3.5-large",
//       "stability-ai/stable-diffusion-3.5-large-turbo",
//     ],
//   },
// };

// export const MODEL_CONFIGS: Record<ModelMode, Record<ProviderKey, string>> = {
//   performance: {
//     replicate: "stability-ai/stable-diffusion-3.5-large-turbo",
//   },
//   quality: {
//     replicate: "stability-ai/stable-diffusion-3.5-large",
//   },
// };

// export const PROVIDER_ORDER: ProviderKey[] = ["replicate"];

// export const initializeProviderRecord = <T>(defaultValue?: T) =>
//   Object.fromEntries(
//     PROVIDER_ORDER.map((key) => [key, defaultValue])
//   ) as Record<ProviderKey, T>;
