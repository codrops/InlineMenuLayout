import { gsap } from 'gsap';
import MenuItem from './menuItem';
import ContentItem from './contentItem';

export default class MenuController {
    constructor(menuEl) {
        this.DOM = {menu: menuEl};
        // Menu item elements
        this.DOM.menuItems = [...this.DOM.menu.querySelectorAll('.menu__item')];
        // Menu item properties that will animate as we move the mouse around the menu
        // we will be using interpolation to achieve smooth animations. 
        // the “previous” and “current” values are the values to interpolate. 
        // the value applied to the element, this case the image element (this.DOM.reveal) will be a value between these two values at a specific increment. 
        // the amt is the amount to interpolate.
        this.animatableProperties = {
            // translationX
            tx: {previous: 0, current: 0, amt: 0.08},
            // translationY
            ty: {previous: 0, current: 0, amt: 0.08},
            // Rotation angle
            rotation: {previous: 0, current: 0, amt: 0.05}
        };
        
        // Array for the MenuItem instances
        this.menuItems = [];
        this.DOM.menuItems.forEach(menuItemEl => this.menuItems.push(new MenuItem(menuItemEl, this.animatableProperties)));
        
        // Array for the ContentItem instances
        this.contentItems = [];
        [...document.querySelectorAll('.content-wrap .content')].forEach(contentItemEl => this.contentItems.push(new ContentItem(contentItemEl)));

        // "show/back to menu" control
        this.DOM.backCtrl = document.querySelector('.back');

        this.initEvents();
    }
    initEvents() {
        // click the menu item shows the content elements associated to this item
        this.DOM.menuItems.forEach((menuItemEl, position) => {
            menuItemEl.addEventListener('click', () => this.onMenuItemClick(position));
        });
        // click the back control shows back the menu
        this.DOM.backCtrl.addEventListener('click', () => this.onBackCtrlClick());
    }
    // gets the menu item (and its texts and number elements) and content item given a specific position/index
    getCurrentData(position) {
        return {
            menuItem: this.menuItems[position],
            // all menu item's texts and numbers
            texts: this.menuItems.map(t => t.DOM.inner),
            numbers: this.menuItems.map(t => t.DOM.number),
            // ...and its contentItem  
            contentItem: this.contentItems[position]
        };
    }
    onMenuItemClick(position) {
        // save the position of the menu item
        this.currentItemIndex = position;
        
        // get elements for this position
        const {menuItem, texts, numbers, contentItem} = this.getCurrentData(position);
        
        // change pointer events so we can't hover on the menu
        this.DOM.menu.style.pointerEvents = 'none';
        menuItem.DOM.el.style.pointerEvents = 'auto';
        menuItem.hideImage().then(() => menuItem.DOM.el.style.pointerEvents = 'none');

        // animate/hide all the menu items (texts and numbers)
        gsap.timeline({
            defaults: {duration: 1, ease: 'expo'}
        })
        .addLabel('hideMenu', 0)
        // set transform origin value for both the texts and content tile elements
        .set([texts, contentItem.DOM.title], {transformOrigin: '50% 100%'}, 'hideMenu')
        // set the content elements starting style
        .set(contentItem.DOM.title, {
            opacity: 0,
            y: '101%'
        }, 'hideMenu')
        .set(contentItem.DOM.number, {
            scale: 0
        }, 'hideMenu')
        .set(contentItem.DOM.imgs, {
            y: '101%'
        }, 'hideMenu')
        .set([contentItem.DOM.caption.title, contentItem.DOM.caption.meta, contentItem.DOM.caption.more], {
            opacity: 0
        }, 'hideMenu')
        // small numbers next to text
        .to(numbers, {
            duration: 0.3,
            ease: 'sine',
            scale: 0,
            opacity: 0,
            stagger: {from: position, each: 0.01}
        }, 'hideMenu')
        // all menu items texts
        .to(texts, {
            duration: 0.1,
            ease: 'quad.in',
            scaleY: 1.5,
            stagger: {from: position, each: 0.01}
        }, 'hideMenu')
        .to(texts, {
            duration: 0.8,
            ease: 'expo',
            scaleY: 1,
            y: '-100%',
            opacity: 0,
            stagger: {from: position, each: 0.01}
        }, 'hideMenu+=0.1')
        // add class content--current to the content element so it becomes visible
        .addLabel('showContent', 0.3)
        // add class current
        .add(() => {
            contentItem.DOM.el.classList.add('content--current');
        }, 'showContent')
        // back control
        .set(this.DOM.backCtrl, {pointerEvents: 'auto'}, 'showContent')
        .to(this.DOM.backCtrl, {
            startAt: {x: '-100%'},
            opacity: 1,
            x: '0%'
        }, 'showContent')
        .to(contentItem.DOM.title, {
            duration: 0.1,
            ease: 'quad.in',
            scaleY: 1.5,
            opacity: 1
        }, 'showContent')
        .to(contentItem.DOM.title, {
            duration: 0.8,
            ease: 'expo',
            scaleY: 1,
            startAt: {y: '100%'},
            y: '0%'
        }, 'showContent+=0.1')
        .to(contentItem.DOM.number, {
            scale: 1
        }, 'showContent')
        .to(contentItem.DOM.imgs, {
            y: '0%',
            stagger: 0.02
        }, 'showContent+=0.1')
        .to([contentItem.DOM.caption.title, contentItem.DOM.caption.meta], {
            startAt: {y: '100%'},
            y: '0%',
            opacity: 1,
            stagger: 0.02
        }, 'showContent+=0.2')
        .to(contentItem.DOM.caption.more, {
            startAt: {scale: 0},
            scale: 1,
            opacity: 1,
            stagger: 0.02
        }, 'showContent+=0.2');
    }
    onBackCtrlClick() {
        // get elements for this position
        const {menuItem, texts, numbers, contentItem} = this.getCurrentData(this.currentItemIndex);
        
        gsap.timeline({
            defaults: {duration: 0.4, ease: 'power3.in'}
        })
        .addLabel('hideContent', 0)
        // set transform origin value for both the texts and content tile elements
        .set([texts, contentItem.DOM.title], {transformOrigin: '50% 0%'}, 'hideContent')
        // back control
        .set(this.DOM.backCtrl, {pointerEvents: 'none'}, 'hideContent')
        .to(this.DOM.backCtrl, {
            opacity: 0,
            x: '-100%'
        }, 'hideContent')
        .to([contentItem.DOM.caption.meta, contentItem.DOM.caption.title], {
            y: '100%',
            opacity: 0,
            stagger: 0.02
        }, 'hideContent')
        .to(contentItem.DOM.caption.more, {
            scale: 0,
            opacity: 0,
            stagger: 0.02
        }, 'hideContent')
        .to(contentItem.DOM.imgs, {
            y: '101%',
            stagger: 0.02
        }, 'hideContent+=0.1')
        .to(contentItem.DOM.number, {
            scale: 0
        }, 'hideContent+=0.1')
        .to(contentItem.DOM.title, {
            y: '100%',
            opacity: 1
        }, 'hideContent+=0.1')
        .addLabel('showMenu', 0.6)
        // remove class content--current to the content element so it becomes invisible
        .add(() => {
            contentItem.DOM.el.classList.remove('content--current');
        }, 'showMenu')
        .add(() => {
            // change pointer events so we can hover on the menu
            this.DOM.menu.style.pointerEvents = '';
            menuItem.DOM.el.style.pointerEvents = '';
        }, 'showMenu')
        // small numbers next to text
        .to(numbers, {
            duration: 0.3,
            ease: 'sine',
            scale: 1,
            opacity: 1,
            stagger: {from: this.currentItemIndex, each: 0.01}
        }, 'showMenu')
        // all menu items texts
        .to(texts, {
            duration: 0.1,
            ease: 'quad.in',
            scaleY: 1.5,
            opacity: 1,
            stagger: {from: this.currentItemIndex, each: 0.01}
        }, 'showMenu')
        .to(texts, {
            duration: 0.8,
            ease: 'expo',
            scaleY: 1,
            y: '0%',
            stagger: {from: this.currentItemIndex, each: 0.01}
        }, 'showMenu+=0.1')
    }
}