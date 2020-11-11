import { preloadImages, preloadFonts } from './utils';
import { preloader } from './preloader';
import Cursor from './cursor';
import MenuController from './menuController';

// Preload images and fonts
Promise.all([preloader('.menu__item'), preloadImages('.gallery__item-imginner'), preloadFonts('zkq2mjw')]).then(() => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');

    // Initialize custom cursor
    const cursor = new Cursor(document.querySelector('.cursor'));

    // Initialize the MenuController
    new MenuController(document.querySelector('.menu'));

    // Mouse effects on all links and buttons
    [...document.querySelectorAll('a, .gallery__item-more, .back')].forEach(link => {
        link.addEventListener('mouseenter', () => cursor.enter());
        link.addEventListener('mouseleave', () => cursor.leave());
    });
});