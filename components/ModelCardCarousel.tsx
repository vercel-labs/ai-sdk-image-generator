// "use client";

// import {
//   Carousel,
//   CarouselApi,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import { ModelSelect } from "./ModelSelect";
// import { cn } from "@/lib/utils";
// import { useState, useEffect, useLayoutEffect, useRef } from "react";
// import { ProviderKey } from "@/lib/provider-config";
// import { ProviderTiming } from "@/lib/image-types";

// interface ModelCardCarouselProps {
//   models: Array<{
//     label: string;
//     models: string[];
//     iconPath: string;
//     color: string;
//     value: string;
//     providerKey: ProviderKey;
//     enabled?: boolean;
//     onToggle?: (enabled: boolean) => void;
//     onChange: (value: string, providerKey: ProviderKey) => void;
//     image: string | null | undefined;
//     timing?: ProviderTiming;
//     failed?: boolean;
//     modelId: string;
//   }>;
// }

// export function ModelCardCarousel({ models }: ModelCardCarouselProps) {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [api, setApi] = useState<CarouselApi>();
//   const initialized = useRef(false);

//   useLayoutEffect(() => {
//     if (!api || initialized.current) return;

//     // Force scroll in multiple ways
//     api.scrollTo(0, false);
//     api.scrollPrev(); // Reset any potential offset
//     api.scrollTo(0, false);

//     initialized.current = true;
//     setCurrentSlide(0);
//   }, [api]);

//   useEffect(() => {
//     if (!api) return;

//     const onSelect = () => {
//       setCurrentSlide(api.selectedScrollSnap());
//     };

//     api.on("select", onSelect);
//     return () => {
//       api.off("select", onSelect);
//       return;
//     };
//   }, [api]);

//   return (
//     <div className="relative w-full mb-8">
//       <Carousel
//         setApi={setApi}
//         opts={{
//           align: "start",
//           dragFree: false,
//           containScroll: "trimSnaps",
//           loop: true
//         }}
//       >
//         <CarouselContent>
//           {models.map((model, i) => (
//             <CarouselItem key={model.label}>
//               <ModelSelect
//                 {...model}
//                 onChange={(value, providerKey) =>
//                   model.onChange(value, providerKey)
//                 }
//               />
//               <div className="text-center text-sm text-muted-foreground mt-4">
//                 {i + 1} of {models.length}
//               </div>
//             </CarouselItem>
//           ))}
//         </CarouselContent>

//         <CarouselPrevious className="left-0 bg-background/80 backdrop-blur-sm" />
//         <CarouselNext className="right-0 bg-background/80 backdrop-blur-sm" />
//       </Carousel>

//       {/* Dot Indicators */}
//       <div className="absolute -bottom-6 left-0 right-0">
//         <div className="flex justify-center gap-1">
//           {models.map((_, index) => (
//             <button
//               key={index}
//               className={cn(
//                 "h-1.5 rounded-full transition-all",
//                 index === currentSlide
//                   ? "w-4 bg-primary"
//                   : "w-1.5 bg-primary/50",
//               )}
//               onClick={() => api?.scrollTo(index)}
//             >
//               <span className="sr-only">Go to model {index + 1}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
