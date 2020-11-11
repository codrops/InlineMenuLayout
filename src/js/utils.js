// Map number x from range [a, b] to [c, d]
const imagesLoaded = require('imagesloaded');

const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

const clamp = (num, min, max) => num <= min ? min : num >= max ? max : num;

// Linear interpolation
const lerp = (a, b, n) => (1 - n) * a + n * b;

// Gets the mouse position
const getMousePos = e => {
    return { 
        x : e.clientX, 
        y : e.clientY 
    };
};

// Preload images
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
    });
};

// Preload images
const preloadFonts = (id) => {
    return new Promise((resolve) => {
        WebFont.load({
            typekit: {
                id: id
            },
            active: resolve
        });
    });
};

export {
    map,
    clamp,
    lerp,
    getMousePos, 
    preloadImages,
    preloadFonts
};