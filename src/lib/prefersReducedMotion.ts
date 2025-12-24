let prefersReducedMotionQuery: MediaQueryList;

export default function prefersReducedMotion() {
    prefersReducedMotionQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
    return prefersReducedMotionQuery.matches;
}