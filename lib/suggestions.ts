// export interface Suggestion {
//   text: string;
//   prompt: string;
// }

// const artStyles = ["anime", "art nouveau", "ukiyo-e", "watercolor"];

// const basePrompts: { text: string; prompt: string }[] = [
//   {
//     text: "Salamander Dusk",
//     prompt: "A salamander at dusk in a forest pond",
//   },
//   {
//     text: "Sultry Chicken",
//     prompt:
//       "A sultry chicken peering around the corner from shadows, clearly up to no good",
//   },
//   {
//     text: "Cat Vercel",
//     prompt: "A cat launching its website on Vercel",
//   },
//   {
//     text: "Red Panda",
//     prompt:
//       "A red panda sipping tea under cherry blossoms at sunset with Mount Fuji in the background",
//   },
//   {
//     text: "Beach Otter",
//     prompt: "A mischievous otter surfing the waves in Bali at golden hour",
//   },
//   {
//     text: "Badger Ramen",
//     prompt: "A pensive honey badger eating a bowl of ramen in Osaka",
//   },
//   {
//     text: "Zen Frog",
//     prompt:
//       "A frog meditating on a lotus leaf in a tranquil forest pond at dawn, surrounded by fireflies",
//   },
//   {
//     text: "Macaw Love",
//     prompt:
//       "A colorful macaw delivering a love letter, flying over the Grand Canyon at sunrise",
//   },
//   {
//     text: "Fox Painting",
//     prompt: "A fox walking through a field of lavender with a golden sunset",
//   },
//   {
//     text: "Armadillo Aerospace",
//     prompt:
//       "An armadillo in a rocket at countdown preparing to blast off to Mars",
//   },
//   {
//     text: "Penguin Delight",
//     prompt: "A penguin in pajamas eating ice cream while watching television",
//   },
//   {
//     text: "Echidna Library",
//     prompt:
//       "An echidna reading a book in a cozy library built into the branches of a eucalyptus tree",
//   },
//   {
//     text: "Capybara Onsen",
//     prompt:
//       "A capybara relaxing in a hot spring surrounded by snow-covered mountains with a waterfall in the background",
//   },
//   {
//     text: "Lion Throne",
//     prompt:
//       "A regal lion wearing a crown, sitting on a throne in a jungle palace, with waterfalls in the distance",
//   },
//   {
//     text: "Dolphin Glow",
//     prompt:
//       "A dolphin leaping through a glowing ring of bioluminescence under a starry sky",
//   },
//   {
//     text: "Owl Detective",
//     prompt:
//       "An owl wearing a monocle and top hat, solving a mystery in a misty forest at midnight",
//   },
//   {
//     text: "Jellyfish Cathedral",
//     prompt:
//       "A jellyfish floating gracefully in an underwater cathedral made of coral and glass",
//   },
//   {
//     text: "Platypus River",
//     prompt: "A platypus foraging in a river with a sunset in the background",
//   },
//   {
//     text: "Chameleon Urban",
//     prompt:
//       "A chameleon blending into a graffiti-covered wall in an urban jungle",
//   },
//   {
//     text: "Tortoise Oasis",
//     prompt:
//       "A giant tortoise slowly meandering its way to an oasis in the desert",
//   },
//   {
//     text: "Hummingbird Morning",
//     prompt:
//       "A hummingbird sipping nectar from a purple bougainvillea at sunrise, captured mid-flight",
//   },
//   {
//     text: "Polar Bear",
//     prompt:
//       "A polar bear clambering onto an iceberg to greet a friendly harbor seal as dusk falls",
//   },
//   {
//     text: "Lemur Sunbathing",
//     prompt:
//       "A ring-tailed lemur sunbathing on a rock in Madagascar in early morning light",
//   },
// ];

// function shuffle<T>(array: T[]): T[] {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// export function getRandomSuggestions(count: number = 5): Suggestion[] {
//   const shuffledPrompts = shuffle(basePrompts);
//   const shuffledStyles = shuffle(artStyles);

//   return shuffledPrompts.slice(0, count).map((item, index) => ({
//     text: item.text,
//     prompt: `${item.prompt}, in the style of ${
//       shuffledStyles[index % shuffledStyles.length]
//     }`,
//   }));
// }