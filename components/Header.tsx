// import Link from "next/link";
// import { Button } from "./ui/button";

// const SparklesIcon = ({ size = 18 }) => {
//   return (
//     <svg
//       data-testid="geist-icon"
//       className="mr-2"
//       height={size}
//       strokeLinejoin="round"
//       viewBox="0 0 16 16"
//       width={size}
//       style={{ color: "currentcolor" }}
//     >
//       <path
//         d="M2.5 0.5V0H3.5V0.5C3.5 1.60457 4.39543 2.5 5.5 2.5H6V3V3.5H5.5C4.39543 3.5 3.5 4.39543 3.5 5.5V6H3H2.5V5.5C2.5 4.39543 1.60457 3.5 0.5 3.5H0V3V2.5H0.5C1.60457 2.5 2.5 1.60457 2.5 0.5Z"
//         fill="currentColor"
//       ></path>
//       <path
//         d="M14.5 4.5V5H13.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H12V3V2.5H12.5C13.0523 2.5 13.5 2.05228 13.5 1.5V1H14H14.5V1.5C14.5 2.05228 14.9477 2.5 15.5 2.5H16V3V3.5H15.5C14.9477 3.5 14.5 3.94772 14.5 4.5Z"
//         fill="currentColor"
//       ></path>
//       <path
//         d="M8.40706 4.92939L8.5 4H9.5L9.59294 4.92939C9.82973 7.29734 11.7027 9.17027 14.0706 9.40706L15 9.5V10.5L14.0706 10.5929C11.7027 10.8297 9.82973 12.7027 9.59294 15.0706L9.5 16H8.5L8.40706 15.0706C8.17027 12.7027 6.29734 10.8297 3.92939 10.5929L3 10.5V9.5L3.92939 9.40706C6.29734 9.17027 8.17027 7.29734 8.40706 4.92939Z"
//         fill="currentColor"
//       ></path>
//     </svg>
//   );
// };

// export const Header = () => {
//   return (
//     <header className="mb-4">
//       <div className="mx-auto flex justify-between items-center">
//         <div>
//           <h1 className="text-xl flex sm:text-2xl sm:font-bold antialiased font-semibold">
//             <Link
//               href="https://sdk.vercel.ai"
//               className="flex items-center mr-2 hover:opacity-75"
//               target="_blank"
//             >
//               <SparklesIcon />
//               AI SDK
//             </Link>
//             Image Generator
//           </h1>
//         </div>
//         <Link
//           href={`https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-image-generator&env=REPLICATE_API_TOKEN&envDescription=Replicate%20API%20token%20required%20for%20this%20demo.&envLink=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-sdk-image-generator&demo-title=AI%20SDK%20Image%20Generator&demo-description=An%20open-source%20AI%20image%20generation%20app%20template%20built%20with%20Next.js%2C%20the%20AI%20SDK%20by%20Vercel%2C%20and%20Replicate.&demo-url=https%3A%2F%2Fai-sdk-image-generator.vercel.app%2F&demo-image=https%3A%2F%2Fai-sdk-image-generator.vercel.app%2Fopengraph-image.png`}
//           target="_blank"
//         >
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src="https://vercel.com/button"
//             className="hidden sm:block"
//             alt="Deploy with Vercel"
//           />
//           <Button size="iconSm" className="block sm:hidden">
//             ▲
//           </Button>
//         </Link>
//       </div>
//     </header>
//   );
// };
