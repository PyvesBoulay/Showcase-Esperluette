function ScrollSnap(animationDuration = 500, scrollDelay = 500) {
    this.anchors = Array.from(document.getElementsByClassName('ScrollSnap_Anchor'));
    if (this.anchors.length > 0) {
        // Check and set the time properties
        if (typeof animationDuration !== "number") animationDuration = 500;
        if (typeof scrollDelay !== "number") scrollDelay = 500;
        this.animationDuration = 500;
        this.scrollDelay = 500;

        this.footer = document.querySelector(".ScrollSnap_Footer");
        if (! this.footer) delete this.footer

        //The current anchor we're snapped to
        this.currentAnchor = 0;
        //The previous anchor we were snapped to, used for animation
        this.previousAnchor = 0;
        //We need a buffer for the scroll detection in order to not detect the scrolling from the animation itself
        this.buffered = false;
        //Are we looking at the footer ?
        this.currentlyOnFooter = false;
        //The last time we snapped to an anchor. Used to impose a delay.
        this.lastScrollTime = Date.now() - this.scrollDelay;
        //The position of the first touch in order to support a swipe
        this.initialTouch = [];
        //Are we scrolling using something else, like holding click or scroll wheel
        this.otherScroll = false;

        //Smoothing function for the animation
        this.easeInOutQuad = function(t, b, c, d) {
            t /= d / 2;
            if (t < 1) {
                return c / 2 * t * t + b
            }
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }.bind(this);

        //Current timestamp of the playing animation
        this.currentAnimTime = 0;

        //This function is what actually scrolls and animates it using a quadratic bezier easing function
        this.animateScroll = function(start, to) {
            document.documentElement.scrollTop = this.easeInOutQuad(this.currentAnimTime, start, to-start, this.animationDuration);
            this.currentAnimTime += 10;
            if (this.currentAnimTime < this.animationDuration) {
                requestAnimationFrame(function () {this.animateScroll(start, to)}.bind(this))
            } else {
                //If the animation is finished, reset the timestamp
                this.currentAnimTime = 0;
                this.buffered = true;
                //And dispatch and ending event
                window.dispatchEvent(new CustomEvent("ScrollSnapEnd", {detail: {fromElement: this.anchors[this.previousAnchor], toElement: this.anchors[this.currentAnchor], fromId: this.previousAnchor, toId: this.currentAnchor}}));
            }
        }.bind(this);

        //Detects what section we are in and updates the current anchor property. Used when the page is loading or when the user scroll in an other way
        this.detectAnchor = function() {
            if (!this.buffered && this.currentAnimTime === 0 && !this.otherScroll) {
                //We are in a new page if at least 45% of it is shown on screen.
                for(let i = 0; i < this.anchors.length; i++) {
                    const anchorRect = this.anchors[i].getBoundingClientRect();

                    if (anchorRect.y <= anchorRect.height*0.45 && anchorRect.y >= -anchorRect.height*0.45) {
                        this.previousAnchor = i;
                        this.currentAnchor = i;

                        window.dispatchEvent(new CustomEvent("ScrollSnapStart", {detail: {fromElement: this.anchors[this.previousAnchor], toElement: this.anchors[this.currentAnchor], fromId: this.previousAnchor, toId: this.currentAnchor}}));

                        break;
                    }
                }
                this.animateScroll(document.documentElement.scrollTop, this.anchors[this.currentAnchor].offsetTop);
            } else {
                this.buffered = false;
            }
        }.bind(this);

        this.scrollbarEnd = function(e) {
            //First make sure the minimum scroll delay is over
            if (Date.now() >= (this.lastScrollTime+this.scrollDelay)) {
                this.lastScrollTime = Date.now();
                this.detectAnchor();
                // this.animateScroll(document.documentElement.scrollTop, this.anchors[this.currentAnchor].offsetTop);
            }
        }.bind(this);

        //Scroll handling function. Must pass scroll event
        this.onScroll = function (e) {
            e.preventDefault();
            e.stopPropagation();
            //First make sure the minimum scroll delay is over
            if (Date.now() >= (this.lastScrollTime+this.scrollDelay) && this.currentAnimTime === 0 && ((Math.abs(e.deltaY) >= 20 && Date.now() >= (this.lastScrollTime+(this.scrollDelay*2))) || Math.abs(e.deltaY>40))) {
                this.lastScrollTime = Date.now();

                //Then detect the scrolling direction
                if (e.deltaY < 0) {
                    if (this.footer && this.currentlyOnFooter) {
                        //We are on the footer and we are trying to jump up to the previous section
                        this.currentlyOnFooter = false;

                        this.animateScroll(document.documentElement.scrollTop, document.documentElement.scrollTop-this.footer.clientHeight);
                    } else if ((this.currentAnchor - 1) >= 0) {
                        //We are scrolling up, snap to the previous anchor or do nothing if we're at the top
                        this.previousAnchor = this.currentAnchor;
                        this.currentAnchor--;

                        //Dispatch event so we can animate other things later
                        window.dispatchEvent(new CustomEvent("ScrollSnapStart", {detail: {fromElement: this.anchors[this.previousAnchor], toElement: this.anchors[this.currentAnchor], fromId: this.previousAnchor, toId: this.currentAnchor}}));

                        this.animateScroll(document.documentElement.scrollTop, this.anchors[this.currentAnchor].offsetTop);
                    }
                } else {
                    //We are scrolling down, snap to the next anchor or do nothing if we're at the bottom
                    if ((this.currentAnchor + 1) < this.anchors.length) {
                        this.previousAnchor = this.currentAnchor;
                        this.currentAnchor++;

                        //Dispatch event so we can animate other things later
                        window.dispatchEvent(new CustomEvent("ScrollSnapStart", {detail: {fromElement: this.anchors[this.previousAnchor], toElement: this.anchors[this.currentAnchor], fromId: this.previousAnchor, toId: this.currentAnchor}}));

                        this.animateScroll(document.documentElement.scrollTop, this.anchors[this.currentAnchor].offsetTop);
                    } else if (this.footer && !this.currentlyOnFooter) {
                        //Exception, there is a footer and we are not currently seeing it, and we scrolled down
                        //Snap the bottom of the footer to the bottom of the footer
                        this.currentlyOnFooter = true;
                        this.animateScroll(document.documentElement.scrollTop, document.documentElement.scrollTop+this.footer.clientHeight);
                    }
                }
            }
        }.bind(this)

        //Finally add the event listeners
        //Mouse scroll: scroll and animation
        window.addEventListener('wheel', this.onScroll.bind(this), {passive: false});
        //Other: detect the section and set currentAnchor
        window.addEventListener('resize', this.detectAnchor.bind(this));
        window.addEventListener('scroll', this.detectAnchor.bind(this));
        window.addEventListener('load', this.detectAnchor.bind(this));
        this.lastMiddleClick = 0;
        window.addEventListener('mousedown', e => {
            if (e.button === 1) this.lastMiddleClick = Date.now()
            this.otherScroll = true;
        });
        window.addEventListener('mouseup', e => {
            if (!(e.button === 1 && Date.now() - this.lastMiddleClick < 300)) {
                this.otherScroll = false;
                this.scrollbarEnd.bind(this);
            }
        });
        window.addEventListener('keydown', e => {
            if (e.code === 'ArrowUp') {
                this.otherScroll = true;
                e.deltaY = -1;
                this.onScroll(e);
            } else if (e.code === 'ArrowDown') {
                this.otherScroll = true;
                e.deltaY = 1;
                this.onScroll(e);
            } else if (e.code === 'Space') {
                this.otherScroll = true;
                e.deltaY = 1;
                this.onScroll(e);
            }
            this.otherScroll = false;
        });

        window.addEventListener('keyup', e => {
            this.otherScroll = false;
        });
        //Swipe listeners
        window.addEventListener('touchstart', function (e) {
            this.initialTouch = [e.touches[0].clientX, e.touches[0].clientY];
        }.bind(this));
        window.addEventListener('touchmove', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.initialTouch.length) {
                const moveTouch = [e.touches[0].clientX, e.touches[0].clientY];
                const diffTouch = [this.initialTouch[0]-moveTouch[0], this.initialTouch[1]-moveTouch[1]];
                //Detect if we swipe vertically
                if (Math.abs(diffTouch[0]) < Math.abs(diffTouch[1])) {
                    //Horizontal
                    if (diffTouch[1] > 0) {
                        e.deltaY = 1;
                        this.onScroll(e);
                    } else {
                        e.deltaY = -1;
                        this.onScroll(e);
                    }
                }
            }
            this.initialTouch = [];
        }.bind(this), {passive: false});
        //Check for page movement every once in a while
        // setInterval(function () {if (Date.now() >= (this.lastScrollTime+this.scrollDelay)) this.detectAnchor()}.bind(this), 750);
        this.detectAnchor();
    }
}