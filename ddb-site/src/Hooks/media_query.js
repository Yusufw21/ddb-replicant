import { useState, useEffect } from "react";

export function useMediaQuery(media) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(media);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [media]);
  return matches;
}
