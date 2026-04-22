// import { useEffect, useState } from "react";

// export function Stopwatch({ startTime }: { startTime: number }) {
//   const [elapsed, setElapsed] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setElapsed(Date.now() - startTime);
//     }, 100);

//     return () => clearInterval(interval);
//   }, [startTime]);

//   return (
//     <div className="text-lg text-zinc-500 font-mono">{(elapsed / 1000).toFixed(1)}s</div>
//   );
// }
