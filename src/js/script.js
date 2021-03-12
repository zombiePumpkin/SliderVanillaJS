class Slide {
  constructor() {
    this.wrapper = document.querySelector('#slider');
    this.items = document.querySelector('#slides');
    this.prev = document.querySelector('#prev');
    this.next = document.querySelector('#next');

    this.posX1 = 0;
    this.posX2 = 0;
    this.posInitial;
    this.posFinal;
    this.threshold = 100;
  
    this.slides = this.items.querySelectorAll('.slide');
    this.slidesLength = this.slides.length;

    const marginLeft = Number(window.getComputedStyle(this.slides[0]).marginLeft.split('')[0]);
    const marginRight = Number(window.getComputedStyle(this.slides[0]).marginRight.split('')[0]);
    const totalMargin = marginLeft + marginRight;
    
    this.slideSize = this.slides[0].offsetWidth + totalMargin;

    this.index = 0;
    this.allowShift = true;
    
    this.cloneFirst = this.slides[0].cloneNode(true);
    this.cloneFirst.classList.add('clone');
    this.cloneLast = this.slides[this.slidesLength - 1].cloneNode(true);
    this.cloneLast.classList.add('clone');
    
    // Clone the first and the last slides
    this.items.insertAdjacentElement('afterBegin', this.cloneLast);
    this.items.insertAdjacentElement('beforeEnd', this.cloneFirst);

    // Script initialized the slider
    this.wrapper.classList.add('loaded');

    // Init the default events on the
    this.initEvents();
  }
  
  initEvents() {
    // User dragStart the left mouse button
    function dragStart(event) {
      this.posInitial = this.items.offsetLeft;
      
      if (event.type === 'touchstart') {
        this.posX1 = event.touches[0].clientX;
      }
      
      if (event.type === 'mousedown') {
        this.posX1 = event.clientX;
        document.addEventListener('mousemove', dragOut);
        document.addEventListener('mouseup', dragEnd);
      }
    }

    // User move the mouse on the screen
    function dragOut(event) {
      if (event.type === 'touchmove') {
        this.posX2 = this.posX1 - event.touches[0].clientX;
        this.posX1 = event.touches[0].clientX;
      }

      if (event.type === 'mousemove') {
        this.posX2 = this.posX1 - event.clientX;
        this.posX1 = event.clientX;
      }
      
      this.items.style.left = (this.items.offsetLeft - this.posX2) + 'px';
    }
    
    // User dragEnd the left mouse button
    function dragEnd() {
      this.posFinal = this.items.offsetLeft;

      if (this.posFinal - this.posInitial < -this.threshold) {
        this.shiftSlide(1, 'drag');
      } else if (this.posFinal - this.posInitial > this.threshold) {
        this.shiftSlide(-1, 'drag');
      } else {
        this.items.style.left = (this.posInitial) + 'px';
      }
  
      document.removeEventListener('mousemove', dragOut);
      document.removeEventListener('mouseup', dragEnd);
    }

    // bind this in the handler functions
    dragStart = dragStart.bind(this);
    dragOut = dragOut.bind(this);
    dragEnd = dragEnd.bind(this);
    
    // Mouse events
    document.addEventListener('mousedown', dragStart);
    
    // Touch events
    document.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', dragOut);
    document.addEventListener('touchend', dragEnd);

    // Transition events
    this.wrapper.addEventListener('transitionend', () => this.checkIndex());
    
    // Click events
    this.prev.addEventListener('click', () => this.shiftSlide(-1));
    this.next.addEventListener('click', () => this.shiftSlide(1));
  }
  
  shiftSlide(dir, action) {
    this.items.classList.add('shifting');
    
    if (this.allowShift) {
      if (!action) { this.posInitial = this.items.offsetLeft; }

      if (dir === 1) {
        this.items.style.left = (this.posInitial - this.slideSize) + 'px';
        this.index++;
      } else if (dir === -1) {
        this.items.style.left = (this.posInitial + this.slideSize) + 'px';
        this.index--;
      }
    };
    
    this.allowShift = false;
  }
    
  checkIndex () {
    this.items.classList.remove('shifting');

    if (this.index === -1) {
      this.items.style.left = -(this.slidesLength * this.slideSize) + 'px';
      this.index = this.slidesLength - 1;
    }

    if (this.index === this.slidesLength) {
      this.items.style.left = -(this.slideSize) + 'px';
      this.index = 0;
    }
    
    this.allowShift = true;
  }
}

const slide = new Slide();

// slidesToLoad = 9
// slidesToShow = 3
