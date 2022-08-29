const windowSize = Math.min(window.innerWidth, window.innerHeight);
const orthoValue = 45;
// UI Canvas
const uiCanvas = document.querySelector('[ui]');
const uiCtx = uiCanvas.getContext('2d');
uiCanvas.width = windowSize;
uiCanvas.height = windowSize;

// Game Canvas
const gameCanvas = document.querySelector('[g]');
gameCanvas.width = windowSize;
gameCanvas.height = windowSize;
// Configure W
W.reset(gameCanvas);
W.light({ x: 0.2, y: -1, z: -0.6 });
W.ambient(0.1);
W.clearColor("#000000");

// Add Cubes to W
W.add("cube", {
    vertices: [
        .5, .5, .5, -.5, .5, .5, -.5, -.5, .5, // front
        .5, .5, .5, -.5, -.5, .5, .5, -.5, .5,
        .5, .5, -.5, .5, .5, .5, .5, -.5, .5, // right
        .5, .5, -.5, .5, -.5, .5, .5, -.5, -.5,
        .5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, // up
        .5, .5, -.5, -.5, .5, .5, .5, .5, .5,
        -.5, .5, .5, -.5, .5, -.5, -.5, -.5, -.5, // left
        -.5, .5, .5, -.5, -.5, -.5, -.5, -.5, .5,
        -.5, .5, -.5, .5, .5, -.5, .5, -.5, -.5, // back
        -.5, .5, -.5, .5, -.5, -.5, -.5, -.5, -.5,
        .5, -.5, .5, -.5, -.5, .5, -.5, -.5, -.5, // down
        .5, -.5, .5, -.5, -.5, -.5, .5, -.5, -.5
    ],
    uv: [
        1, 1, 0, 1, 0, 0, // front
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // right
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // up
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // left
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // back
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // down
        1, 1, 0, 0, 1, 0
    ]
});

// Define Ortho Projection
const ortho = (near, far) => {
    return new DOMMatrix([
        2 / (orthoValue * 2), 0, 0, 0,
        0, 2 / (orthoValue * 2), 0, 0,
        0, 0, -2 / (far - near), 0,
        0, 0, -(far + near) / (far - near), 1
    ]);
};

// World to Screen squares
let c = {
    rX: 0, // red square
    rY: 0, // red square
    gX: 0, // green square
    gY: 0, // green square
    bX: 0, // blue square
    bY: 0 //  blue square
};

const screenToWorld = (x, y) => {
    const point = new DOMPoint(orthoValue * 2 * x - orthoValue, 1, orthoValue * 4 * y - orthoValue * 3);
    return W.v.inverse()
        .multiply(W.projection)
        .transformPoint(point);
};

// W.v          = projection-view matrix (It seems?)
// W.vo         = original view matrix without any transformation
// W.projection = projection matrix
const worldToScreen = (x, z) => {
    const redPoint = W.vo.transformPoint(new DOMPoint(x, 1, z));
    const greenPoint = W.vo.transformPoint(new DOMPoint(x, z, 1));
    const bluePoint = W.v.transformPoint(new DOMPoint(x, 1, z));
    return {
        rX: redPoint.x,
        rY: redPoint.z,
        gX: greenPoint.x,
        gY: greenPoint.y,
        bX: bluePoint.x,
        bY: bluePoint.z
    };
};

let mouseX = null;
let mouseY = null;
let worldX = null;
let worldZ = null;
uiCanvas.addEventListener("mousemove", (e) => {
    const rect = e.target.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    if (!W.v) return;
    const { x, z } = screenToWorld(mouseX / rect.width, mouseY / rect.height);
    worldX = Math.min(size - 1, Math.max(0, Math.round(x)));
    worldZ = Math.min(size - 1, Math.max(0, Math.round(z)));

    W.move({ n: "world-cursor", x: worldX, y: -0.4, z: worldZ });
    c = worldToScreen(Math.round(x), Math.round(z));
});

setTimeout(() => {
    W.projection = ortho(1, 999);
    W.camera({ x: 0, y: 32, z: 50, rx: -45, ry: -45 });
}, 1);


const size = 50;
W.cube({ g: "map", x: (size - 1) / 2, y: -0.5, z: (size - 1) / 2, h: 1, w: size, d: size, b: "#aa7777" });
W.cube({ g: "map", n: "world-cursor", x: size / 2, y: -0.4, z: size / 2, h: 1, w: 1, d: 1, b: "#ffff0080" });

let lastUpdate = 0;
const main = function (t) {
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

    uiCtx.fillStyle = "#00aaff";
    uiCtx.fillRect(c.bX, c.bY, 10, 10);
    uiCtx.fillStyle = "#ff0000";
    uiCtx.fillRect(c.rX, c.rY, 8, 8);
    uiCtx.fillStyle = "#00ff00";
    uiCtx.fillRect(c.gX, c.gY, 6, 6);

    window.requestAnimationFrame(main);
};

window.play = () => {
    uiCanvas.removeAttribute("n");
    gameCanvas.removeAttribute("n");
    main();
};

window.play();