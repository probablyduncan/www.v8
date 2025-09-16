export default function runOnLoad(callback: () => void) {
    document.addEventListener("DOMContentLoaded", callback);
    document.addEventListener("astro:after-swap", callback);
}