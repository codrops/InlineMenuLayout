import { gsap } from 'gsap';
import { map, lerp, clamp, getMousePos } from './utils';
const images = Object.entries(require('../img/*.jpg'));

// track the mouse position
let mousepos = {x: 0, y: 0};
// cache the mouse position
let mousePosCache = mousepos;
// mouse movement direction
let direction = {x: mousePosCache.x-mousepos.x, y: mousePosCache.y-mousepos.y};
// update mouse position when moving the mouse
window.addEventListener('mousemove', ev => mousepos = getMousePos(ev));

export default class MenuItem {
    constructor(el, animatableProperties) {
        this.DOM = {el: el};
        this.DOM.inner = this.DOM.el.querySelector('.menu__item-inner');
        this.DOM.number = this.DOM.el.querySelector('.menu__item-number');
        // menu item properties that will animate as we move the mouse around the menu
        this.animatableProperties = animatableProperties;
        // create the image structure
        this.layout();
        // initialize some events
        this.initEvents();
    }
    // create the image structure
    // we want to add/append to the menu item the following html:
    // <div class="hover-reveal">
    //   <div class="hover-reveal__inner" style="overflow: hidden;">
    //     <div class="hover-reveal__img" style="background-image: url(pathToImage);">
    //     </div>
    //   </div>
    // </div>
    layout() {
        // this is the element that gets its position animated (and perhaps other properties like the rotation etc..)
        this.DOM.reveal = document.createElement('div');
        this.DOM.reveal.className = 'hover-reveal';
        this.DOM.reveal.style.transformOrigin = '0% 0%';
        // the next two elements could actually be only one, the image element
        // adding an extra wrapper (revealInner) around the image element with overflow hidden, gives us the possibility to scale the image inside
        this.DOM.revealInner = document.createElement('div');
        this.DOM.revealInner.className = 'hover-reveal__inner';
        this.DOM.revealImage = document.createElement('div');
        this.DOM.revealImage.className = 'hover-reveal__img';
        const imgpos = this.DOM.el.dataset.img.match(/([\w\d_-]*)\.?[^\\\/]*$/i)[1]-1;
        this.DOM.revealImage.style.backgroundImage = `url(${images[imgpos][1]})`;
        this.DOM.el.dataset.img
        this.DOM.revealInner.appendChild(this.DOM.revealImage);
        this.DOM.reveal.appendChild(this.DOM.revealInner);
        this.DOM.el.appendChild(this.DOM.reveal);
    }
    initEvents() {
        this.mouseenterFn = () => {
            // show the image element
            this.showImage();
            this.firstRAFCycle = true;
            // start the render loop animation (rAF)
            this.loopRender();
        };

        this.mouseleaveFn = () => {
            // stop the render loop animation (rAF)
            this.stopRendering();
            // hide the image element
            this.hideImage();
        };
        
        this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
        this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
    }
    // calculate the position/size of both the menu item and reveal element
    calcBounds() {
        this.bounds = {
            el: this.DOM.el.getBoundingClientRect(),
            reveal: this.DOM.reveal.getBoundingClientRect()
        };
    }
    // shows the menu item image
    showImage() {
        // kill any current tweens
        gsap.killTweensOf(this.DOM.revealInner);
        gsap.killTweensOf(this.DOM.revealImage);
        gsap.timeline({
            defaults: {duration: 0.8, ease: 'quint'},
            onStart: () => {
                // show reveal and inner element
                this.DOM.reveal.style.opacity = this.DOM.revealInner.style.opacity = 1;
                // set a high z-index value so image appears on top of other elements
                gsap.set(this.DOM.el, {zIndex: images.length});
            }
        })
        // animate the image wrap
        .to(this.DOM.revealInner, {
            startAt: {x: '-50%', y: '150%', rotation: 10},
            x: '0%',
            y: '0%',
            //rotation: 10
        }, 0)
        // scale animation for both inner & image
        .to(this.DOM.revealInner, {
            duration: 1, 
            ease: 'expo',
            startAt: {scale: 0.2},
            scale: 1
        }, 0)
        .to(this.DOM.revealImage, {
            duration: 1, 
            ease: 'expo',
            startAt: {scale: 1.8},
            scale: 1
        }, 0);
    }
    // hides the menu item image
    hideImage() {
        return new Promise(resolve => {
            // kill any current tweens
            gsap.killTweensOf(this.DOM.revealInner);
            gsap.killTweensOf(this.DOM.revealImage);
            gsap.timeline({
                defaults: {duration: 0.8, ease: 'quint'},
                onStart: () => {
                    gsap.set(this.DOM.el, {zIndex: 1});
                },
                onComplete: () => {
                    gsap.set(this.DOM.reveal, {opacity: 0});
                    resolve();
                }
            })
            .to(this.DOM.revealInner, {
                scale: 0.8,
                x: '50%',
                y: '-150%',
                opacity: 0,
                //rotation: 0
            })
            .to(this.DOM.revealImage, {
                scale: 1.8
            }, 0);
        });
    }
    // start the render loop animation (rAF)
    loopRender() {
        if ( !this.requestId ) {
            this.requestId = requestAnimationFrame(() => this.render());
        }
    }
    // stop the render loop animation (rAF)
    stopRendering() {
        if ( this.requestId ) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }
    }
    // translate the item as the mouse moves
    render() {
        this.requestId = undefined;

        if ( this.firstRAFCycle ) {
            // calculate position/sizes the first time
            this.calcBounds();
        }
        // calculate the mouse distance (current vs previous cycle)
        const mouseDistanceX = clamp(Math.abs(mousePosCache.x - mousepos.x), 0, 100);
        // direction where the mouse is moving
        direction = {x: mousePosCache.x-mousepos.x, y: mousePosCache.y-mousepos.y};
        // updated cache values
        mousePosCache = {x: mousepos.x, y: mousepos.y};

        // new translation values
        this.animatableProperties.tx.current = Math.abs(mousepos.x - this.bounds.el.left) - this.bounds.reveal.width/2;
        this.animatableProperties.ty.current = Math.abs(mousepos.y - this.bounds.el.top) - this.bounds.reveal.height/2;
        // new rotation value
        this.animatableProperties.rotation.current = this.firstRAFCycle ? 0 : map(mouseDistanceX,0,200,0,direction.x < 0 ? -100 : 100);
        
        // set up the interpolated values
        // for the first cycle, both the interpolated values need to be the same so there's no "lerped" animation between the previous and current state
        this.animatableProperties.tx.previous = this.firstRAFCycle ? this.animatableProperties.tx.current : lerp(this.animatableProperties.tx.previous, this.animatableProperties.tx.current, this.animatableProperties.tx.amt);
        this.animatableProperties.ty.previous = this.firstRAFCycle ? this.animatableProperties.ty.current : lerp(this.animatableProperties.ty.previous, this.animatableProperties.ty.current, this.animatableProperties.ty.amt);
        this.animatableProperties.rotation.previous = this.firstRAFCycle ? this.animatableProperties.rotation.current : lerp(this.animatableProperties.rotation.previous, this.animatableProperties.rotation.current, this.animatableProperties.rotation.amt);
        
        // set styles
        gsap.set(this.DOM.reveal, {
            x: this.animatableProperties.tx.previous,
            y: this.animatableProperties.ty.previous,
            rotation: this.animatableProperties.rotation.previous
        });

        // loop
        this.firstRAFCycle = false;
        this.loopRender();
    }
}