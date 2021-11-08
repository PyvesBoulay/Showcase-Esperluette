function Carousel(element, animationDuration = 500) {
    if (element && element.dataset.images){
        //Store the images we'll display
        this.images = JSON.parse(element.dataset.images);

        if (this.images.length > 0) {

            if (typeof animationDuration !== "number") {
                animationDuration = 500;
            }

            //The carousel element
            this.carousel = element;

            //Duration of the transitional animation
            this.animationDuration = animationDuration;

            //create the needed elements
            if (!document.getElementById('carousel_style')) {
                const style = document.createElement('style');
                style.innerText = '.carousel {\n' +
                    '    position:relative;\n' +
                    '    display: flex;\n' +
                    '    align-items: center;\n' +
                    '    justify-content: center;\n' +
                    '    background-color: rgba(0, 0, 0, 0.03);\n' +
                    '    isolation: isolate;\n' +
                    '}\n' +
                    '\n' +
                    '.carousel img {\n' +
                    '    position: absolute;\n' +
                    '    max-width: 100%;\n' +
                    '    left: 25%;' +
                    '    top: 50%;' +
                    '    transform: translate(-50%, -50%);' +
                    '}\n' +
                    '\n' +
                    '.carousel_prev, .carousel_next {\n' +
                    '    position: absolute;\n' +
                    '    left: 50%;\n' +
                    '    transform: translateX(-50%);\n' +
                    '    z-index: 10;\n' +
                    '    filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.5));' +
                    '}\n' +
                    '.carousel_prev div, .carousel_next div {' +
                    '    transition: background-color 300ms;\n' +
                    '    background-color: rgba(255, 255, 255, 0.8);\n' +
                    '    width: 2rem;\n' +
                    '    height: 2rem;\n' +
                    '}' +
                    '\n' +
                    '.carousel_prev div {\n' +
                    '    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);\n' +
                    '}\n' +
                    '.carousel_next div {\n' +
                    '    clip-path: polygon(50% 100%, 0 0, 100% 0);\n' +
                    '}\n' +
                    '.carousel_prev {\n' +
                    '    top: -3rem;\n' +
                    '}\n' +
                    '.carousel_next {\n' +
                    '    bottom: -3rem;\n' +
                    '}\n' +
                    '.carousel_text {\n' +
                    '    transition: all 500ms;\n' +
                    '}\n' +
                    '.carousel_prev:hover > div, .carousel_next:hover > div{\n' +
                    '    background-color: rgba(255, 255, 255, 1);\n' +
                    '}\n' +
                    '.carousel_dot_wrapper {\n' +
                    '    position: absolute;\n'+
                    '    left: 0;\n'+
                    '    top: 50%;\n'+
                    '    transform: translate(-50%, -50%);\n' +
                    '    display: flex;\n' +
                    '    flex-direction: row;\n' +
                    '}\n';
                style.id = "carousel_style";
                document.head.appendChild(style);
            }

            //If we have carousel_text elements in the carousel, count them to make sure we have as much text as we have images
            //carousel_text elements can be wrapped in a carousel_text_wrapper
            this.texts = [];
            if (this.carousel.childElementCount === this.images.length || (this.carousel.childElementCount === 1 && this.carousel.firstElementChild.classList.contains('carousel_text_wrapper') && this.carousel.firstElementChild.childElementCount === this.images.length)) {

                const addText = function (e) {
                    if(e.nodeType === 1 && e.classList.contains('carousel_text')) {
                        this.texts.push(e);
                        e.style.opacity = 0;
                    }
                }.bind(this);

                //We have to make sure we take the elements from the right place
                if (this.carousel.firstElementChild.classList.contains('carousel_text_wrapper')) {
                    Array.from(this.carousel.firstElementChild.childNodes).forEach(addText);
                } else {
                    Array.from(this.carousel.childNodes).forEach(addText);
                }

                //Check one last time we have the correct amount of eleemnts and if so, show the first one
                if (this.texts.length !== this.images.length) {
                    this.texts = [];
                } else {
                    this.texts[0].style.opacity = 1;
                }
            }

            //Generate the image elements and setup
            //The id of the currently displayed image in the image element
            this.currentState = [];

            //Image elements of the carousel
            this.images_els = [];
            let tempOffset = -3;
            for (let i = 0; i < 5; i++) {
                this.images_els.push(document.createElement('img'));
                this.images_els[i].alt = 'Carousel image';
                this.images_els[i].style.maxHeight = window.getComputedStyle(this.carousel, null).height;
                this.images_els[i].style.transform = 'translate('+25*tempOffset+'%, '+50*tempOffset+'%) scale('+(100+(35*((tempOffset+1)<1?(tempOffset+1):(tempOffset+1)*(-1))))+'%)';
                this.images_els[i].style.opacity = Math.round((0.965-(0.24*((tempOffset+1)*(tempOffset+1)))) * 10) / 10+'';
                this.images_els[i].style.zIndex = (tempOffset+1)<1?(tempOffset+1):(tempOffset+1)*(-1);
                this.images_els[i].style.transition = 'all '+this.animationDuration+'ms';
                //Set the starting ids, make sure that the middle image element gets the first image of the list and wrap around
                this.currentState.push((i+(this.images.length-2))%(this.images.length));
                this.images_els[i].src = this.images[this.currentState[i]]
                this.carousel.appendChild(this.images_els[i]);
                tempOffset++;
            }

            //Add the controls
            this.dotWrapper = document.createElement('div');
            this.dotWrapper.className = 'carousel_dot_wrapper';
            this.indicator = document.createElement('span');
            this.indicator.innerText = '1';
            this.dotWrapper.appendChild(this.indicator);
            this.dotWrapper.appendChild(document.createTextNode("\u00A0/ "+this.images.length));
            this.nextButton = document.createElement('div');
            this.nextButton.className = 'carousel_next';
            let arrow = document.createElement('div');
            this.nextButton.appendChild(arrow);
            this.dotWrapper.appendChild(this.nextButton);
            this.prevButton = document.createElement('div');
            this.prevButton.className = 'carousel_prev';
            arrow = document.createElement('div');
            this.prevButton.appendChild(arrow);
            this.dotWrapper.appendChild(this.prevButton);
            this.carousel.appendChild(this.dotWrapper);

            //Prevents starting an animation before the previous one is done.
            this.antiSpam = true;

            this.prev = function () {
                if (this.antiSpam) {
                    this.antiSpam = false;
                    const onTransEnd = function () {
                        //Once the animation is finished, unlock the buttons and tp the image outside of the range to the other side
                        this.images_els[4].removeEventListener('transitionend', onTransEnd);
                        //Place the last image in the first position
                        //We bypass the css transition property by setting it to a duration of 0s.
                        //However we can't instantly set it back otherwise the changes won't be flushed to the css, so we use a timeout of 1ms.
                        this.images_els.unshift(this.images_els.pop());
                        this.images_els[0].style.transitionDuration = '0s';
                        this.images_els[0].style.transform = 'translate('+25*-3+'%, '+50*-3+'%) scale(0.3)';
                        setTimeout(function() {this.images_els[0].style.transitionDuration = this.animationDuration+'ms';}.bind(this), 1)
                        this.images_els[0].src = this.images[this.currentState[0]];
                        this.antiSpam = true;
                    }.bind(this)

                    this.images_els[4].addEventListener('transitionend', onTransEnd);

                    //Compute the new order and animate into position
                    let tempOffset = -2;
                    for (let i = 0; i < 5; i++) {
                        this.images_els[i].style.transform = 'translate('+25*tempOffset+'%, '+50*tempOffset+'%) scale('+(100+(35*((tempOffset+1)<1?(tempOffset+1):(tempOffset+1)*(-1))))+'%)';
                        this.images_els[i].style.zIndex = (tempOffset+1)<1?(tempOffset+1):(tempOffset+1)*(-1);
                        tempOffset++;
                        this.images_els[i].style.opacity = Math.round((0.965-(0.24*(tempOffset*tempOffset))) * 10) / 10+'';
                        this.currentState[i] = (this.currentState[i]+this.images.length-1)%(this.images.length);
                    }

                    //Hide the text matching the previous image and show the new one
                    if(this.texts.length) {
                        this.texts[this.currentState[3]].style.opacity = 0;
                        this.texts[this.currentState[2]].style.opacity = 1;
                    }
                    this.indicator.innerText = (parseInt(this.indicator.innerText)===this.images.length?1:parseInt(this.indicator.innerText)+1);
                }
            }

            this.next = function () {
                if (this.antiSpam) {
                    this.antiSpam = false;
                    const onTransEnd = function () {
                        //Once the animation is finished, unlock the buttons and tp the image outside of the range to the other side
                        this.images_els[0].removeEventListener('transitionend', onTransEnd);
                        //Place the last image in the first position
                        //We bypass the css transition property by setting it to a duration of 0s.
                        //However we can't instantly set it back otherwise the changes won't be flushed to the css, so we use a timeout of 1ms.
                        this.images_els[0].style.transitionDuration = '0s';
                        this.images_els[0].style.transform = 'translate(25%, 50%) scale(0.3)';
                        this.images_els[0].src = this.images[this.currentState[4]];
                        this.images_els.push(this.images_els.shift());
                        //Set the timout after array changes so we make sure nothing gets confused.
                        setTimeout(function() {this.images_els[4].style.transitionDuration = this.animationDuration+'ms';}.bind(this), 1)
                        this.antiSpam = true;
                    }.bind(this)

                    this.images_els[0].addEventListener('transitionend', onTransEnd);

                    //Compute the new order and animate into position
                    let tempOffset = 0;
                    for (let i = 4; i >= 0; i--) {
                        this.images_els[i].style.transform = 'translate('+25*tempOffset+'%, '+50*tempOffset+'%) scale('+(100+(35*((tempOffset+1)<1?(tempOffset+1):(tempOffset+1)*(-1))))+'%)';
                        this.images_els[i].style.zIndex = (tempOffset+1)<1?(tempOffset+1):(tempOffset+1)*(-1);
                        tempOffset--;
                        this.images_els[i].style.opacity = Math.round((-0.005-0.971*tempOffset-0.242*(tempOffset*tempOffset))* 10) / 10+'';
                        this.currentState[i] = (this.currentState[i]+1)%(this.images.length);
                    }

                    //Hide the text matching the previous image and show the new one
                    if(this.texts.length) {
                        this.texts[this.currentState[1]].style.opacity = 0;
                        this.texts[this.currentState[2]].style.opacity = 1;
                    }
                    this.indicator.innerText = (parseInt(this.indicator.innerText)===1?this.images.length:parseInt(this.indicator.innerText)-1);
                }
            }

            // //Arrow click listeners
            this.nextButton.addEventListener('click', function () {this.next()}.bind(this));
            this.prevButton.addEventListener('click', function () {this.prev()}.bind(this));
        }
    }
}