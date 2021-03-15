class Slide {
  constructor(options) {
    // Default options
    this.slidesToShow = options.slidesToShow;
    this.slidesToLoad = options.slidesToLoad;
    this.showButtons = options.showButtons;
    this.showPaging = options.showPaging;
    this.infinite = options.infinite;

    // Selecting all the slide elements in the page
    this.container = document.querySelector('#slider');
    this.view = this.container.querySelector('.wrapper');
    this.wrapper = this.container.querySelector('#slides');
    this.slides = this.container.querySelectorAll('.slide');

    // Setting the initial element positions
    this.index = 0;
    this.posX1 = 0;
    this.posX2 = 0;
    this.startPos = 0;
    this.endPos = 0;
    this.limit = 75;
    this.allowShift = true;
  
    // Getting the element properties
    const marginLeft = Number(
      window.getComputedStyle(this.slides[0])
        .marginLeft
        .split('')[0]
    );
    const marginRight = Number(
      window.getComputedStyle(this.slides[0])
        .marginRight
        .split('')[0]
    );
    const totalMargin = marginLeft + marginRight;
    this.slideSize = this.slides[0].offsetWidth + totalMargin;
    this.slidesLength = this.slides.length;
    
    // Set the max number of slides to load
    if (!isNaN(this.slidesToLoad) && this.slidesToLoad !== null) {
      if (this.slidesToLoad <= this.slidesLength) {
        this.slides.forEach((element, index) => {
          if (index >= this.slidesToLoad) element.remove();
        });
        this.slidesLength = this.slidesToLoad;
      }
    }

    // Cloning the slides to make perception of a ininite slider
    const cloneFirst = this.slides[0].cloneNode(true);
    cloneFirst.classList.add('clone');
    const cloneLast = this.slides[this.slidesLength - 1].cloneNode(true);
    cloneLast.classList.add('clone');
    
    this.wrapper.insertAdjacentElement('afterBegin', cloneLast);
    this.wrapper.insertAdjacentElement('beforeEnd', cloneFirst);

    // Hide clones when infinity mode is off
    if (!this.infinite) {
      this.wrapper.querySelectorAll('.clone').forEach((element) => {
        element.classList.add('hide')
      });
    }

    // Adjusting the position of the wrapper
    this.wrapper.style.left = -(this.slideSize) + 'px';

    // Adjusting the size of the view
    if (this.infinite) {
      this.view.style.width = (
        (this.slides[0].offsetWidth * this.slidesToShow) + 50
      ) + 'px';
    } else {
      this.view.style.width = (this.slideSize * this.slidesToShow) + 'px';
    }

    // Creating the button navigators
    if (this.showButtons) {
      // Previous button
      this.prev = document.createElement('span');
      this.prev.setAttribute('id', 'prev');
      this.prev.classList.add('control', 'prev');
      if (!this.infinite) this.prev.classList.add('hide');
      
      // Next button
      this.next = document.createElement('span');
      this.next.setAttribute('id', 'next');
      this.next.classList.add('control', 'next');

      // Iserting the buttons in slider element
      this.view.insertAdjacentElement('beforeBegin', this.prev);
      this.view.insertAdjacentElement('afterEnd', this.next);

      // Init click events
      this.prev.addEventListener('click', () => this.shiftSlide(-1));
      this.next.addEventListener('click', () => this.shiftSlide(1));
    }

    // Creating the paging navigation
    if (this.showPaging) {
      this.paging = document.createElement("div");
      this.paging.classList.add('paging');
      this.container.insertAdjacentElement('beforeEnd', this.paging);

      // Init paging items and click events
      this.pagingLoader();
    }

    // Init events in the page
    this.initEvents();

    // Slider is loaded
    this.container.classList.add('loaded');
  }
  
  initEvents () {
    // User press the left mouse button
    function dragStart(event) {
      this.startPos = this.wrapper.offsetLeft;
      
      if (event.type === 'touchstart') {
        this.posX1 = event.touches[0].clientX;
      }
      if (event.type === 'mousedown') {
        this.posX1 = event.clientX;
        this.container.addEventListener('mouseup', dragEnd);
        this.container.addEventListener('mousemove', dragOut);
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
      
      this.wrapper.style.left = (this.wrapper.offsetLeft - this.posX2) + 'px';
    }
    
    // User release the left mouse button
    function dragEnd() {
      this.endPos = this.wrapper.offsetLeft;

      if (this.endPos - this.startPos < -this.limit) {
        this.shiftSlide(1, 'drag');
      } else if (this.endPos - this.startPos > this.limit) {
        this.shiftSlide(-1, 'drag');
      } else {
        this.wrapper.style.left = (this.startPos) + 'px';
      }

      this.container.removeEventListener('mouseup', dragEnd);
      this.container.removeEventListener('mousemove', dragOut);
    }

    // Bind this in the handler functions
    dragStart = dragStart.bind(this);
    dragOut = dragOut.bind(this);
    dragEnd = dragEnd.bind(this);
    
    // Mouse events
    this.container.addEventListener('mousedown', dragStart);
    
    // Touch events
    this.container.addEventListener('touchstart', dragStart);
    this.container.addEventListener('touchmove', dragOut);
    this.container.addEventListener('touchend', dragEnd);

    // Transition events
    this.container.addEventListener('transitionend', () => this.checkIndex());
  }
  
  shiftSlide (dir, action) {
    this.wrapper.classList.add('shifting');

    if (this.allowShift) {
      if (!action) { this.startPos = this.wrapper.offsetLeft; }

      if (dir === 1) {
        this.wrapper.style.left = (this.startPos - this.slideSize) + 'px';
        this.index++;
      } else if (dir === -1) {
        this.wrapper.style.left = (this.startPos + this.slideSize) + 'px';
        this.index--;
      }
    };

    this.allowShift = false;
  }
    
  checkIndex () {
    this.wrapper.classList.remove('shifting');

    if (this.infinite) {
      if (this.index === -1) {
        this.wrapper.style.left = -(this.slidesLength * this.slideSize) + 'px';
        this.index = this.slidesLength - 1;
      }

      if (this.index === this.slidesLength) {
        this.wrapper.style.left = -(this.slideSize) + 'px';
        this.index = 0;
      }
    } else {
      if (this.index === -1) {
        this.wrapper.style.left = -(this.slideSize) + 'px';
        this.index = 0;
      }

      if (this.index === this.slidesLength) {
        this.wrapper.style.left = -(this.slidesLength * this.slideSize) + 'px';
        this.index = this.slidesLength - 1;
      }

      if (this.showButtons) {
        if (this.index === 0) { 
          this.prev.classList.add('hide');
        }
        
        if (this.index === this.slidesLength - 1) {
          this.next.classList.add('hide');
        }
        
        if (this.index !== 0) {
          if (this.prev.classList.contains('hide')) {
            this.prev.classList.remove('hide');
          }
        }
        
        if (this.index !== this.slidesLength - 1) {
          if (this.next.classList.contains('hide')) {
            this.next.classList.remove('hide');
          }
        }
      }
    }

    if (this.showPaging) {
      this.paging.querySelectorAll('.index').forEach((element, index) => { 
        if (index === this.index) {
          if (!element.classList.contains('active')) { 
            element.classList.add('active');
          }
        } else {
          if (element.classList.contains('active')) {
            element.classList.remove('active');
          }
        }
      });
    }
    
    this.allowShift = true;
  }

  shiftPaging (index) {
    this.wrapper.classList.add('shifting');

    if (index !== 0) {
      this.wrapper.style.left = -((index + 1) * this.slideSize) + 'px';
    } else {
      this.wrapper.style.left = -(this.slideSize) + 'px';
    }

    this.index = index;
    this.allowShift = false;
  }

  pagingLoader() {
    for (let i = 0; i < this.slidesLength; i++) {
      const pagingItem = document.createElement("span");

      pagingItem.classList.add('index');
      if (i === 0) pagingItem.classList.add('active');

      pagingItem.addEventListener('click', () => { 
        this.shiftPaging(i);
      });
      
      this.paging.insertAdjacentElement('beforeEnd', pagingItem);
    }
  }
}

const slide = new Slide(
  {
    slidesToLoad: 5,
    slidesToShow: 2,
    showButtons: false,
    showPaging: true,
    infinite: true
  }
);
