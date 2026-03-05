import Vec2 from "@probablyduncan/common/vec2";
import { releaseGrabbables } from "../lib/grabbable";
import getScreenSize from "./screenSize";
import prefersReducedMotion from "./prefersReducedMotion";

export const slideDataAttributes = {
    container: "data-slide-container",
    slide: "data-slide",
    trigger: "data-slide-trigger",
} as const;

export type SlideData = {
    id: string;
    slideEl: HTMLElement;
    targetPos: Vec2 | null;
    currentPos: Vec2;
};

export function initIndexSlides() {
    const state: {
        currentSlideId: string | null;
        mousePos: Vec2 | null;
        mouseDir: Vec2;
    } = {
        currentSlideId: null,
        mousePos: null,
        mouseDir: Vec2.Zero,
    };

    const slides = new Map<string, SlideData>();

    const slidesContainerEl = document.querySelector(`[${slideDataAttributes.container}]`) as HTMLElement;
    if (!slidesContainerEl) return;

    document.querySelectorAll(`[${slideDataAttributes.slide}]`).forEach((_e) => {
        const slideEl = _e as HTMLElement;
        const id = slideEl.dataset.slide;

        if (!id) {
            return;
        }

        const slide: SlideData = {
            id,
            slideEl,
            targetPos: null,
            currentPos: Vec2.Zero,
        }

        if (id === "default") {
            state.currentSlideId = id;
        }
        else {
            slide.currentPos = getOffScreenPosition(slide, Vec2.From(0, 1));
            slide.slideEl.style.transform = `translate(${slide.currentPos.x}px, ${slide.currentPos.y}px)`;
        }

        if (prefersReducedMotion()) {
            return;
        }

        slides.set(id, slide);

        document.querySelectorAll(`[${slideDataAttributes.trigger}='${id}']`).forEach((triggerEl) => {
            triggerEl.addEventListener("mouseenter", (e) => {
                if (state.currentSlideId === id || scrolling) return;

                // if prev slide on screen, set it to animate out
                if (state.currentSlideId && slides.has(state.currentSlideId)) {
                    const prevSlide = slides.get(state.currentSlideId)!;
                    prevSlide.targetPos = getOffScreenPosition(prevSlide, state.mouseDir);
                    releaseGrabbables(prevSlide.slideEl);
                }

                state.currentSlideId = id;
                slide.targetPos = null;

                const newSlideBoundingRect = getChildrenBoundingClientRect(slide.slideEl);

                // if new slide not already on screen, move it to the correct spot just off screen
                if (!isOnScreen(newSlideBoundingRect)) {
                    slide.currentPos = getOffScreenPosition(
                        slide,
                        state.mouseDir.negate(),
                        newSlideBoundingRect,
                    );
                    releaseGrabbables(slide.slideEl);
                }
            })
        });
    });

    window.addEventListener("mousemove", ({ clientX, clientY }) => {
        const newMousePos = Vec2.From(clientX, clientY);
        const oldMousePos = state.mousePos ?? newMousePos;
        const mousePosDelta = newMousePos.subtract(oldMousePos);
        state.mouseDir = mousePosDelta.normalized();
        state.mousePos = newMousePos;

        const els = document.elementsFromPoint(clientX, clientY);
        if (state.currentSlideId && slides.has(state.currentSlideId) && els.some(el => el.matches(`[${slideDataAttributes.trigger}='${state.currentSlideId}']`))) {
            const currentSlide = slides.get(state.currentSlideId)!;
            currentSlide.targetPos = (currentSlide.targetPos ?? Vec2.Zero).add(mousePosDelta.divide(10));
        }
    });

    let scrolling = false;
    window.addEventListener("scroll", () => {
        if (!scrolling) {
            scrolling = true;
        }
    });

    window.addEventListener("scrollend", () => {
        scrolling = false;
        state.mouseDir = Vec2.Zero;
    });

    let prevTimeMS: DOMHighResTimeStamp = 0;
    function animate(thisTimeMS: DOMHighResTimeStamp) {
        requestAnimationFrame(animate);

        const deltaMS = thisTimeMS - prevTimeMS;
        prevTimeMS = thisTimeMS;

        if (!state.mousePos) {
            return;
        }

        const lerp = Vec2.From(Math.min(1, deltaMS * 0.0030625));

        slides.forEach((slide) => {
            if (slide.targetPos) {
                // prev slides should go out a little slower/floatier
                const newLerp =
                    slide.id === state.currentSlideId ? lerp : lerp.divide(1.5);
                slide.currentPos = newLerp.lerp(slide.currentPos, slide.targetPos);
                slide.slideEl.style.transform = `translate(${slide.currentPos.x}px, ${slide.currentPos.y}px)`;
            }
        });
    }

    if (slides.size > 0) {
        requestAnimationFrame(animate);
    }
}

function isOnScreen(boundingRect: DOMRect) {
    const { top, left, bottom, right } = boundingRect;

    return !(
        bottom < 0 ||
        right < 0 ||
        top > window.innerHeight ||
        left > window.innerWidth
    );
}

function getOffScreenPosition(slide: SlideData, dir: Vec2, boundingRect?: DOMRect) {
    const { width, height, left, top } = boundingRect ?? getChildrenBoundingClientRect(slide.slideEl);
    const screen = getScreenSize();

    const containerCenterPos = Vec2.From(left + width / 2, top + height / 2);
    const noTranslateCenterPos = containerCenterPos.subtract(
        slide.currentPos,
    );

    const horiz = dir.x > 0 ? "right" : "left";
    const vert = dir.y > 0 ? "bottom" : "top";

    const screenCornerNearDir = Vec2.From(
        horiz === "left" ? 0 : screen.x,
        vert === "top" ? 0 : screen.y,
    );

    const dirToCorner = noTranslateCenterPos
        .subtract(screenCornerNearDir)
        .normalized();
    const side = Math.abs(dirToCorner.y) > Math.abs(dir.y) ? horiz : vert;

    let result = Vec2.Zero;
    if (side === "bottom") {
        const downDistance = screen.y + height / 2 - noTranslateCenterPos.y;
        const sideDistance = dir.y === 0 ? 0 : (downDistance * dir.x) / dir.y;
        result = Vec2.From(sideDistance, downDistance);
    } else if (side === "top") {
        const upDistance = height / -2 - noTranslateCenterPos.y;
        const sideDistance = dir.y === 0 ? 0 : (upDistance * dir.x) / dir.y;
        result = Vec2.From(sideDistance, upDistance);
    } else if (side === "right") {
        const rightDistance = screen.x + width / 2 - noTranslateCenterPos.x;
        const vertDistance = dir.x === 0 ? 0 : (rightDistance * dir.y) / dir.x;
        result = Vec2.From(rightDistance, vertDistance);
    } else if (side === "left") {
        const leftDistance = width / -2 - noTranslateCenterPos.x;
        const vertDistance = dir.x === 0 ? 0 : (leftDistance * dir.y) / dir.x;
        result = Vec2.From(leftDistance, vertDistance);
    }

    return result.multiply(1.2);
}

function getChildrenBoundingClientRect(el: HTMLElement): DOMRect {

    let leftest = Infinity,
        rightest = -Infinity,
        topmost = Infinity,
        bottommost = -Infinity;

    for (let i = 0; i < el.children.length; i++) {
        const { left, right, top, bottom } = el.children[i].getBoundingClientRect();

        if (leftest > left) {
            leftest = left;
        }
        if (rightest < right) {
            rightest = right;
        }
        if (topmost > top) {
            topmost = top;
        }
        if (bottommost < bottom) {
            bottommost = bottom;
        }
    }

    return new DOMRect(leftest, topmost, rightest - leftest, bottommost - topmost);
}