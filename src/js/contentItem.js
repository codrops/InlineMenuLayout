import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import Splitting from "splitting";
import { gsap } from 'gsap';

export default class ContentItem {
    constructor(el) {
        this.DOM = {el: el};

        Splitting();

        this.DOM.title = this.DOM.el.querySelector('.content__title-inner');
        this.DOM.number = this.DOM.el.querySelector('.content__title-number');
        this.DOM.imgs = [...this.DOM.el.querySelectorAll('.gallery__item-imginner')];
        this.DOM.caption = {
            title: this.DOM.el.querySelectorAll('.gallery__item-caption > .gallery__item-title'),
            meta: this.DOM.el.querySelectorAll('.gallery__item-caption > .gallery__item-meta'),
            more: this.DOM.el.querySelectorAll('.gallery__item-caption > .gallery__item-more')
        }

        this.initEvents();
    }
    // hover the plus symbol (.gallery__item-more)
    initEvents() {
        this.DOM.caption.more.forEach((more, pos) => {
            const img = this.DOM.imgs[pos];
            const chars = this.DOM.caption.title[pos].querySelectorAll('.char');

            more.addEventListener('mouseenter', () => {
                gsap.killTweensOf([img, chars]);
                gsap.timeline({
                    defaults: {
                        duration: 1, 
                        ease: 'expo',
                    }
                })
                .to(img, {scale: 0.95})
                .to(chars, {x: pos => pos*2}, 0);
            });
            more.addEventListener('mouseleave', () => {
                gsap.killTweensOf([img, chars]);
                gsap.timeline({
                    defaults: {
                        duration: 0.5, 
                        ease: 'expo',
                    }
                })
                .to(img, {scale: 1})
                .to(chars, {x: 0}, 0);
            });
        });
    }
}