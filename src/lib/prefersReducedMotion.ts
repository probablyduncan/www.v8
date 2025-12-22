const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

export default function prefersReducedMotion() {
    return prefersReducedMotionQuery.matches;
}