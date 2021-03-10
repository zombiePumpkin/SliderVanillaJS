class Slide {
  constructor(slider, items, prev, next) {
    this.slider = slider;
    this.items = items;
    this.prev = prev;
    this.next = next;

    this.posX1 = 0;
    this.posX2 = 0;
    this.posInitial = this.items.offsetLeft;
    this.posFinal = this.items.offsetLeft;
    this.threshold = 100;
    this.slides = this.items.getElementsByClassName('slide');
    this.slidesLength = this.slides.length;
    this.slideSize = this.items.getElementsByClassName('slide')[0].offsetWidth;
    this.firstSlide = this.slides[0],
    this.lastSlide = this.slides[this.slidesLength - 1],
    this.cloneFirst = this.firstSlide.cloneNode(true),
    this.cloneLast = this.lastSlide.cloneNode(true),
    this.index = 0,
    this.allowShift = true;

    // Clone first and last slide
    items.appendChild(this.cloneFirst);
    items.insertBefore(this.cloneLast, this.firstSlide);
    slider.classList.add('loaded');
    
    // Mouse events
    items.onmousedown = this.dragStart;
    
    // Touch events
    items.addEventListener('touchstart', this.dragStart);
    items.addEventListener('touchend', this.dragEnd);
    items.addEventListener('touchmove', this.dragAction);
    
    // Click events
    prev.addEventListener('click', () => {this.shiftSlide(-1)});
    next.addEventListener('click', () => {this.shiftSlide(1)});
    
    // Transition events
    items.addEventListener('transitionend', this.checkIndex);
  }

  dragStart (e) {
    e = e || window.event;
    e.preventDefault();
    
    if (e.type == 'touchstart') {
      this.posX1 = e.touches[0].clientX;
    } else {
      this.posX1 = e.clientX;
      document.onmouseup = this.dragEnd;
      document.onmousemove = this.dragAction;
    }
  }

  dragAction (e) {
    e = e || window.event;
    
    if (e.type == 'touchmove') {
      this.posX2 = this.posX1 - e.touches[0].clientX;
      this.posX1 = e.touches[0].clientX;
    } else {
      this.posX2 = this.posX1 - e.clientX;
      this.posX1 = e.clientX;
    }
    this.items.style.left = (this.items.offsetLeft - this.posX2) + "px";
  }

  dragEnd (e) {
    if (this.posFinal - this.posInitial < -this.threshold) {
      shiftSlide(1, 'drag');
    } else if (this.posFinal - this.posInitial > this.threshold) {
      shiftSlide(-1, 'drag');
    } else {
      this.items.style.left = (posInitial) + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

  shiftSlide(dir, action) {
    this.items.classList.add('shifting');
    
    if (this.allowShift) {
      if (!action) { this.posInitial = this.items.offsetLeft; }

      if (dir == 1) {
        this.items.style.left = (this.posInitial - this.slideSize) + 'px';
        this.index++;      
      } else if (dir == -1) {
        this.items.style.left = (this.posInitial + this.slideSize) + 'px';
        this.index--;      
      }
    };
    
    this.allowShift = false;
  }

  checkIndex (){
    this.items.classList.remove('shifting');

    if (this.index == -1) {
      this.items.style.left = -(this.slidesLength * this.slideSize) + 'px';
      this.index = this.slidesLength - 1;
    }

    if (this.index == this.slidesLength) {
      this.items.style.left = -(1 * this.slideSize) + 'px';
      this.index = 0;
    }
    
    this.allowShift = true;
  }
}

const slider = document.getElementById('slider');
const items = document.getElementById('slides');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

slide = new Slide(slider, items, prev, next);
