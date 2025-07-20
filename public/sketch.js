let staticCanvas;
let dynamicCanvas;

let doodles = [];
let closestMousedOverDoodle = null;
let squiggles = [];
let sounds = [];
let images = [];
// let doodleShader;

let backgroundTexture;

const colors = [
    '#E63946', '#457B9D', '#1D3557',
    '#F4A261', '#2A9D8F', '#E9C46A', 
    '#6B705C', '#3A0CA3', '#118AB2', '#EF476F', '#06D6A0',
]

const numSounds = 30;
const numImages = 54;

const doodleDefaultDim = 512;
const doodleDefaultScale = 0.5;
const doodleRandomSizeBase = 0.25;
const doodleRandomSizeRange = 0.5;
const squiggleDrawTime = 0.075;
const squiggleRandomness = 0.33;
const squiggleDurationModifier = 0.5;

function createRand(seed) {
    let hashArr = cyrb128("" + seed);
    return sfc32(hashArr[0], hashArr[1], hashArr[2], hashArr[3]);
}

function randomRange(min, max, rand=Math.random) {
    return min + rand() * (max - min);
}

class Squiggle {
    constructor(x0, y0, x1, y1, thickness, randomness, numSegments, duration, color) {
        // save parameters 
        this.seed = Math.random();
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.thickness = thickness;
        this.randomness = randomness;
        this.numSegments = numSegments;
        this.color = color;
        this.color.setAlpha(50);
        this.start = createVector(this.x0, this.y0);
        this.end = createVector(this.x1, this.y1);
        this.vec = p5.Vector.sub(this.end, this.start);
        this.segment = 1;
        this.doneDrawing = false;
        this.countdown = 0;
        this.duration = duration;
    }

    generate() {

    }

    draw() { 
        this.rand = createRand(this.seed);
        let canvas;
        if (this.doneDrawing) {
            return;
        }
        if (this.segment < this.numSegments) {
            canvas = staticCanvas;
        } else {
            canvas = staticCanvas;
        }
        
        canvas.push();
        canvas.beginShape();
        canvas.strokeCap(ROUND);
        canvas.noFill();
        canvas.stroke(this.color);
        canvas.strokeWeight(this.thickness);
        canvas.curveVertex(this.x0, this.y0);
        canvas.curveVertex(this.x0, this.y0);
        let currentVec;
        for (let i = 1; i < this.segment; i++) {
            const t = i / this.numSegments;
            currentVec = p5.Vector.lerp(this.start, this.end, t);
            const normal = createVector(-this.vec.y, this.vec.x).normalize();
            normal.mult(randomRange(-this.randomness, this.randomness, this.rand));
            currentVec.add(normal);
            canvas.curveVertex(currentVec.x, currentVec.y);
        }
        if (this.doneDrawing) {
            canvas.curveVertex(this.x1, this.y1);
            canvas.curveVertex(this.x1, this.y1);
        } 
        canvas.endShape();
        canvas.pop();
    }

    increment() {
        if (this.countdown > this.duration / this.numSegments) {
            this.segment++;
            this.countdown = 0;
            // console.log("Incrementing segment of squiggle.");
        } else {
            this.countdown += deltaTime / 1000;
        }
        if (this.segment > this.numSegments) {
            this.segment = this.numSegments;
            this.doneDrawing = true;
            if (this.onDone) {
                this.onDone();
            }
        }
    }
}

function chainDoodle(prevDoodle) {
    const seed = prevDoodle == null ? Math.random() : prevDoodle.seed;
    // console.log("Creating doodle seeded with seed " + seed + ".");
    const rand = createRand(seed); // can be null
    let imageIndex;
    let soundIndex;
    while (imageIndex == null || imageIndex == prevDoodle?.imageIndex) {
        imageIndex = Math.floor(rand() * numImages);
    }
    while (soundIndex == null || soundIndex == prevDoodle?.soundIndex) {
        soundIndex = Math.floor(rand() * numSounds);
    }
    let x = Math.random() * windowWidth;
    let y = Math.random() * windowHeight;
    if (prevDoodle == null) {
        x = (0.5 * Math.random() + 0.25) * windowWidth;
        y = (0.5 * Math.random() + 0.25) * windowHeight;
    }
    const dim = getRandomDoodleDim();
    const halfDim = dim * 0.5;
    x = constrain(x, halfDim, windowWidth - halfDim);
    y = constrain(y, halfDim, windowHeight - halfDim);
    const col = color(colors[Math.floor(rand() * colors.length)]);
    const doodle = new Doodle(x, y, imageIndex, soundIndex, col, dim, rand());
    doodles.push(doodle);
    let squiggle;
    if (prevDoodle != null) {
        const x0 = prevDoodle.x + squiggleRandomness * (Math.random() * doodleDefaultDim * doodleDefaultScale - doodleDefaultDim * doodleDefaultScale * 0.5);
        const y0 = prevDoodle.y + squiggleRandomness * (Math.random() * doodleDefaultDim * doodleDefaultScale - doodleDefaultDim * doodleDefaultScale * 0.5);
        const x1 = doodle.x + squiggleRandomness * (Math.random() * doodleDefaultDim * doodleDefaultScale - doodleDefaultDim * doodleDefaultScale * 0.5);
        const y1 = doodle.y + squiggleRandomness * (Math.random() * doodleDefaultDim * doodleDefaultScale - doodleDefaultDim * doodleDefaultScale * 0.5);
        const duration = doodle.sound.duration() * squiggleDurationModifier;
        let squiggleColor = color(
        red(prevDoodle.color),
        green(prevDoodle.color),
        blue(prevDoodle.color),
            0.5
        );
        squiggle = new Squiggle(x0, y0, x1, y1, 0.5 + 1.5 * rand(), 10 + 20 * rand(), 20, duration, squiggleColor);
        squiggles.push(squiggle);
    }

    if (squiggle == null) {
        doodle.drawOnCanvas(staticCanvas);
    } else {
        squiggle.onDone = () => {
            doodle.drawOnCanvas(staticCanvas);
        }
    }
    
    doodle.clickEvent = () => {
        chainDoodle(doodle);
    }
}

function getRandomDoodleDim(rand=Math.random) {
    return doodleDefaultDim * (doodleRandomSizeBase + Math.random() * doodleRandomSizeRange);
}

function makeImageFromMask(mask, color) {
    let rColor = red(color);
    let gColor = green(color);
    let bColor = blue(color);

    let newImage = createImage(mask.width, mask.height); // Create a new image with the same size
    newImage.loadPixels();
    mask.loadPixels();

    for (let i = 0; i < mask.pixels.length; i+=4) {
        let r = mask.pixels[i];
        if (r < 35) r = 0;
        let alpha = r;

        newImage.pixels[i] = rColor;
        newImage.pixels[i+1] = gColor;
        newImage.pixels[i+2] = bColor;
        newImage.pixels[i+3] = alpha;
    }

    newImage.updatePixels();
    return newImage;
}

class Doodle {
    constructor(x, y, imageIndex, soundIndex, col, dim, seed) {
        this.x = x;
        this.y = y;
        this.imageIndex = imageIndex;
        this.soundIndex = soundIndex;
        this.doodleIndex = doodles.length;
        this.seed = randomRange(0, 10000);
        this.color = col;
        const img = images[imageIndex];
        const sound = sounds[soundIndex];
        this._dim = dim;
        this._x0 = x - dim * 0.5;
        this._y0 = y - dim * 0.5;
        this._x1 = x + dim * 0.5;
        this._y1 = y + dim * 0.5;
        this._img = makeImageFromMask(img, col);
        this.sound = sound;
        this._inBounds = false;
        // console.log("Created doodle button " + this.doodleIndex + " at (" + x + ", " + y + ") with image index " + imageIndex + " and sound index " + soundIndex + ".");
    }

    drawOnCanvas(canvas) {
        if (canvas == staticCanvas) {
            if (!this._drawnOnStaticCanvas) {
                this._drawnOnStaticCanvas = true;
            } else {
                return;
            }
        } 
        // this._shader.setUniform('u_color', this.color.levels);
        // this._shader.setUniform('u_texture', this._img);
        canvas.push();
        // canvas.shader(this._shader);
        canvas.noStroke();
        // canvas.fill(this.color);
        canvas.translate(this.x, this.y);
        // canvas.rect(-this._dim/2, -this._dim/2, this._dim, this._dim);
        canvas.image(this._img, -this._dim/2, -this._dim/2, this._dim, this._dim);
        canvas.pop();
    }

    onClick() {
        if (this._inBounds) {
            this.sound.play();
            // console.log("Playing sound " + this.soundIndex + " from doodle " + this.doodleIndex + ".");
            if (this.clickEvent) {
                this.clickEvent();
            }
        }
    }

    inBounds() {
        if (mouseX >= this._x0 && mouseX <= this._x1 && mouseY >= this._y0 && mouseY <= this._y1) {
            // console.log("Mouse is in bounds of doodle " + this.doodleIndex + ".");
            this._inBounds = true;
        } else {
            if (this._inBounds) {
                // console.log("Mouse has left the bounds of doodle " + this.doodleIndex + ".");
            }
            this._inBounds = false;
        }
        return this._inBounds;
    }

    distance() {
        return dist(mouseX, mouseY, this._x0, this._y0);
    }
}

function getClosestMousedOverDoodle() {
    let closestDoodle = null;
    for (let doodle of doodles) {
        if (doodle.inBounds() && (closestDoodle == null || doodle.distance() < closestDoodle.distance())) {
            closestDoodle = doodle;
        }
    }
    return closestDoodle;
}

function preload() {
    soundFormats('mp3', 'wav');
    for (let i = 1; i <= numSounds; i++) {
        const path = 'audio/poetry/' + i + '.mp3';
        const sound = loadSound(path);
        sound.setLoop(false);
        sounds.push(sound);
    }
    for (let i = 1; i <= numImages; i++) {
        let path = 'drawings/cutouts/' + i + '.jpg';
        let img = loadImage(path);
        images.push(img);
    }
    backgroundTexture = loadImage('drawings/paper.jpg');
    doodleShader = loadShader('shaders/plane.vert', 'shaders/doodle.frag');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    staticCanvas = createGraphics(windowWidth, windowHeight);
    dynamicCanvas = createGraphics(windowWidth, windowHeight);
    staticCanvas.image(backgroundTexture, 0, 0, windowWidth, windowHeight);
    chainDoodle();
    // outputVolume(0.65);
}

function draw() {
    // background(220);
    dynamicCanvas.clear();
    closestMousedOverDoodle = getClosestMousedOverDoodle();
    if (closestMousedOverDoodle != null) {
        closestMousedOverDoodle.drawOnCanvas(dynamicCanvas);
    }
    blendMode(BLEND);
    const newSquiggles = [];
    for (let squiggle of squiggles) {
        squiggle.draw();
        squiggle.increment();
        if (!squiggle.doneDrawing) {
            newSquiggles.push(squiggle);
        }
    }
    squiggles = newSquiggles;
    image(staticCanvas, 0, 0);
    blendMode(ADD);
    image(dynamicCanvas, 0, 0);
    // for (let doodle of doodles) {
    //     doodle.inBounds();
    //     doodle.draw();
    // }
}

function mousePressed() {
    if (closestMousedOverDoodle != null) {
        closestMousedOverDoodle.onClick();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    staticCanvas.resizeCanvas(windowWidth, windowHeight);
    dynamicCanvas.resizeCanvas(windowWidth, windowHeight);
}
  