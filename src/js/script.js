class Slide {
  constructor() {
    // Selecting all the slide elements in the page
    this.container = document.querySelector('#slider');
    this.wrapper = this.container.querySelector('#slides');
    this.slides = this.container.querySelectorAll('.slide');
    this.prev = this.container.querySelector('#prev');
    this.next = this.container.querySelector('#next');

    // Setting the initial element positions
    this.index = 0;
    this.posX1 = 0;
    this.posX2 = 0;
    this.startPos;
    this.endPos;
    this.limit = 25;
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

    // Cloning the slides to make perception of a ininite slider
    const cloneFirst = this.slides[0].cloneNode(true);
    cloneFirst.classList.add('clone');
    const cloneLast = this.slides[this.slidesLength - 1].cloneNode(true);
    cloneLast.classList.add('clone');
    
    // Clone the first and the last slides
    this.wrapper.insertAdjacentElement('afterBegin', cloneLast);
    this.wrapper.insertAdjacentElement('beforeEnd', cloneFirst);
    this.container.insertAdjacentHTML(
      'beforeEnd',
      '<div class="paging"></div>'
    );
    this.paging = this.container.querySelector('.paging');
    this.pagingLoader();

    // Init events in the page
    this.initEvents();

    // Alider is loaded
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
    
    // Click events
    this.prev.addEventListener('click', () => this.shiftSlide(-1));
    this.next.addEventListener('click', () => this.shiftSlide(1));
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

    if (this.index === -1) {
      this.wrapper.style.left = -(this.slidesLength * this.slideSize) + 'px';
      this.index = this.slidesLength - 1;
    }

    if (this.index === this.slidesLength) {
      this.wrapper.style.left = -(this.slideSize) + 'px';
      this.index = 0;
    }
    
    this.allowShift = true;
  }

  shiftPaging (index) {
    this.wrapper.classList.add('shifting');
    this.allowShift = false;

    // Somar o index com quantidade de slides à mostra
    const pagingIndex = index + 1;
    
    this.paging.querySelectorAll('.index').forEach((element) => {
      if (element.classList.contains('active')) {
        element.classList.remove('active')
      }
    });

    if (pagingIndex !== 0) {
      this.wrapper.style.left = -(pagingIndex * this.slideSize) + 'px';
    } else {
      this.wrapper.style.left = -(this.slideSize) + 'px';
    }

    this.index = pagingIndex;
  }

  pagingLoader() {
    // Dividir total de slides por quantidade de slides à mostra
    const quantity = this.slidesLength / 1;

    for (let i = 0; i < quantity; i++) {
      const pagingButton = document.createElement("button");
      const buttonLabel = document.createTextNode(i + 1);

      pagingButton.classList.add('index');
      if (i === 0) pagingButton.classList.add('active');
      pagingButton.setAttribute('type', 'button');
      pagingButton.appendChild(buttonLabel);

      pagingButton.addEventListener('click', () => { 
        this.shiftPaging(i);
        pagingButton.classList.add('active');
      });
      
      this.paging.insertAdjacentElement('beforeEnd', pagingButton);
    }
  }
}

const slide = new Slide();

// slidesToLoad = 9
// slidesToShow = 3
