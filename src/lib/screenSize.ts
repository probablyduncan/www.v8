import Vec2 from "@probablyduncan/common/vec2";

let _screenSize: Vec2;

export default function getScreenSize() {
    if (!_screenSize) {
        init();
    }

    return _screenSize;
}

function setScreenSize() {

    _screenSize ??= new Vec2(0);
    _screenSize.x = window.innerWidth;
    _screenSize.y = window.innerHeight;
}

function init() {
    window.addEventListener("resize", setScreenSize);
    setScreenSize();
}