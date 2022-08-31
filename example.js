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
        1 / orthoValue, 0, 0, 0,
        0, 1 / orthoValue, 0, 0,
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

const screenToWorld = (x, y, z) => {
    // On the screen, +y is down, but in WebGL, +y is up. Flip the y coordinate.
    const point = new DOMPoint(x * 2 - 1, -(y * 2 - 1), z);
    return W.v.inverse()
        .transformPoint(point);
};

function add(a, b) {
    return new DOMPoint(a.x + b.x, a.y + b.y, a.z + b.z);
}

function subtract(a, b) {
    return new DOMPoint(a.x - b.x, a.y - b.y, a.z - b.z);
}

function scale(a, scalar) {
    return new DOMPoint(a.x * scalar, a.y * scalar, a.z * scalar);
}

function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize(a) {
    let length = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    return new DOMPoint(a.x / length, a.y / length, a.z / length);
}

const plane_center = new DOMPoint(0, 0, 0);
const plane_normal = new DOMPoint(0, 1, 0);
function intersect_xz(near, far) {
    let ray_direction = subtract(far, near);
    let t = dot(subtract(plane_center, near), plane_normal) / dot(ray_direction, plane_normal);
    return add(near, scale(ray_direction, t));
}

// W.v          = projection-view matrix (It seems?)
// W.vo         = original view matrix without any transformation
// W.projection = projection matrix
const worldToScreen = (rect, x, z) => {
    const redPoint = W.v.transformPoint(new DOMPoint(x, 1, z));
    return {
        rX: (redPoint.x + 1) / 2  * rect.width,
        // In WebGL, +y is up, but on the screen, +y is down. Flip the y coordinate.
        rY: (-redPoint.y + 1) / 2 * rect.height,
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
    let near = screenToWorld(mouseX / rect.width, mouseY / rect.height, -1);
    let far = screenToWorld(mouseX / rect.width, mouseY / rect.height, 1);
    let {x, z} = intersect_xz(near, far);
    worldX = Math.min(size - 1, Math.max(0, Math.round(x)));
    worldZ = Math.min(size - 1, Math.max(0, Math.round(z)));

    W.move({ n: "world-cursor", x: worldX, y: -0.4, z: worldZ });
    c = worldToScreen(rect, Math.round(x), Math.round(z));
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

    // uiCtx.fillStyle = "#ff000099";
    // uiCtx.fillRect(c.rX - 4, c.rY - 4, 8, 8);

    uiCtx.textAlign = "center";
    uiCtx.textBaseline = "middle";
    uiCtx.fillStyle = "#ffffff";
    uiCtx.font = "20px monospace";
    uiCtx.fillText(`(${worldX}, ${worldZ})`, c.rX, c.rY - 20);

    window.requestAnimationFrame(main);
};

window.play = () => {
    uiCanvas.removeAttribute("n");
    gameCanvas.removeAttribute("n");
    main();
};

window.play();
