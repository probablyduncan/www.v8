import Vec2 from "@probablyduncan/common/vec2";
import prefersReducedMotion from "../lib/prefersReducedMotion";

export const grabbableDataAttribute = "data-grabbable" as const;

export function initGrabbables() {
    const grabbables: {
        el: HTMLElement;
        targetTranslate: Vec2;
        currentTranslate: Vec2;
        grabbing: boolean;
        grabStartMousePos: Vec2 | null;
        grabStartTranslatePos: Vec2 | null;
    }[] = [];

    document.querySelectorAll(`[${grabbableDataAttribute}]`).forEach((_el) => {
        const el = _el as HTMLElement;

        const info: (typeof grabbables)[number] = {
            el,
            currentTranslate: Vec2.Zero,
            targetTranslate: Vec2.Zero,
            grabbing: false,
            grabStartMousePos: null,
            grabStartTranslatePos: null,
        };

        grabbables.push(info);

        el.addEventListener("mousedown", (e) => {
            if (!canGrab()) return;

            info.grabbing = true;
            info.el.classList.add("grabbing");
            document.body.style.cursor = "grabbing";

            info.grabStartMousePos = Vec2.From(e.clientX, e.clientY);
            info.grabStartTranslatePos = info.currentTranslate;
            
            // I don't like this, it's kind of the whole point to have to uncover stuff
            // info.el.parentElement?.appendChild(info.el);
            // maybe i can do something with intersection observer
            // put other grabbables behind current one only when they're not intersecting?
        });
    });

    window.addEventListener("mouseup", () => {
        if (!canGrab()) return;

        document.body.style.cursor = "unset";
        grabbables.forEach((g) => {
            if (g.grabbing) {
                g.grabbing = false;
                g.grabStartMousePos = null;
                g.grabStartTranslatePos = null;
                g.el.classList.remove("grabbing");
            }
        });
    });

    window.addEventListener("mousemove", (e) => {
        if (!canGrab()) return;

        grabbables.forEach((g) => {
            if (
                !g.grabbing ||
                !g.grabStartMousePos ||
                !g.grabStartTranslatePos
            ) {
                return;
            }
            const newPos = Vec2.From(e.clientX, e.clientY);
            g.targetTranslate = newPos
                .subtract(g.grabStartMousePos)
                .add(g.grabStartTranslatePos);
        });
    });

    let prevTimeMS: DOMHighResTimeStamp = 0;
    function animate(thisTimeMS: DOMHighResTimeStamp) {
        requestAnimationFrame(animate);

        const deltaMS = thisTimeMS - prevTimeMS;
        prevTimeMS = thisTimeMS;

        const lerp = Vec2.From(Math.min(1, deltaMS * 0.0030625));
        grabbables.forEach((g) => {
            if (!g.el.style.transform) {
                g.targetTranslate = Vec2.Zero;
            }

            g.currentTranslate = lerp.lerp(
                g.currentTranslate,
                g.targetTranslate,
            );
            g.el.style.transform = `translate(${g.currentTranslate.x}px, ${g.currentTranslate.y}px)`;
        });
    }
    requestAnimationFrame(animate);
}

export function canGrab() {
    return !prefersReducedMotion() && window.innerWidth > 720;
}

export function releaseGrabbables(parentEl?: Element) {
    (parentEl ?? document).querySelectorAll(`[${grabbableDataAttribute}]`).forEach(e => {
        (e as HTMLElement).style.transform = "";
    });
}

export function releaseGrabbable(grabbableEl: HTMLElement) {
    if (!grabbableEl.matches(`[${grabbableDataAttribute}]`)) {
        return;
    }

    grabbableEl.style.transform = "";
}