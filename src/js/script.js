// Main class
class Slider {
  constructor(options, sliderElements) {
    // Parameters destructuring
    const { 
      slidesToShow,
      slidesToLoad,
      showButtons,
      showPaging,
      infinite
    } = options;

    const { 
      container,
      view,
      wrapper,
      slides 
    } = sliderElements;

    // Slider config options
    this.slidesToShow = slidesToShow;
    this.slidesToLoad = slidesToLoad;
    this.showButtons = showButtons;
    this.showPaging = showPaging;
    this.infinite = infinite;

    // Main slider elements
    this.container = document.querySelector(container);
    this.view = document.querySelector(view);
    this.wrapper = document.querySelector(wrapper);
    this.slides = this.wrapper.querySelectorAll(slides);

    // Initial slider position values
    this.index = 0;
    this.posX1 = 0;
    this.posX2 = 0;
    this.startPos = 0;
    this.endPos = 0;
    this.limit = 50;
    this.allowShift = true;

    // Main slider element properties
    const marginLeft = Number(
      getComputedStyle(this.slides[0])
        .marginLeft
        .split('')[0]
    );

    const marginRight = Number(
      getComputedStyle(this.slides[0])
        .marginRight
        .split('')[0]
    );

    const totalMargin = marginLeft + marginRight;

    this.slideSize = this.slides[0].offsetWidth + totalMargin;
    this.slidesLength = this.slides.length;

    // Set the total size of the wrapper
    this.wrapper.style.width = String(this.slideSize * this.slidesToLoad) + 'px';

    // Set the max number of slides to load
    if (!isNaN(this.slidesToLoad) && this.slidesToLoad !== null) {
      if (this.slidesToLoad <= this.slidesLength) {
        for (let i = 0; i < this.slidesLength; i++) {
          if (i >= this.slidesToLoad) this.slides[0].remove();
        }
        this.slidesLength = this.slidesToLoad;
      }
    }

    // Cloning the slides to make perception of a ininite slider
    if (this.infinite) {
      const cloneFirst = this.slides[0].cloneNode(true);
      cloneFirst.classList.add('clone');
      const cloneLast = this.slides[this.slidesLength - 1].cloneNode(true);
      cloneLast.classList.add('clone');

      this.wrapper.insertAdjacentElement('afterbegin', cloneLast);
      this.wrapper.insertAdjacentElement('beforeend', cloneFirst);
    }

    // Hide clones when infinity mode is off
    if (!this.infinite) {
      this.wrapper.querySelectorAll('.clone').forEach((element) => {
        element.classList.add('hide')
      });
    }

    // Adjusting the position of the wrapper
    if (this.infinite) {
      this.wrapper.style.left = -(this.slideSize) + 'px';
    } else {
      this.wrapper.style.left = '0px';
    }

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
      this.prev = document.createElement('span')
      this.prev.setAttribute('id', 'prev');
      this.prev.classList.add('control', 'prev');
      if (!this.infinite) this.prev.classList.add('hide');

      // Next button
      this.next = document.createElement('span')
      this.next.setAttribute('id', 'next');
      this.next.classList.add('control', 'next');

      // Iserting the buttons in slider element
      this.view.insertAdjacentElement('beforebegin', this.prev);
      this.view.insertAdjacentElement('afterend', this.next);

      // Init click events
      this.prev.addEventListener('click', () => this.shiftSlide(-1));

      this.next.addEventListener('click', () => this.shiftSlide(1));
    }

    // Creating the paging navigation
    if (this.showPaging) {
      this.paging = document.createElement("div");
      this.paging.classList.add('paging');

      this.container.insertAdjacentElement('beforeend', this.paging);

      // Init paging items and click events
      this.pagingBuilder();
    }

    // Slider is loaded
    this.container.classList.add('loaded');
  }

  initKeyBoardEvents(...elementNames) {
    // Fix the tab button press on the end of inputs inside forms
    this.container.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        const eventInput = event.target;

        elementNames.forEach((element) => {
          if (element === eventInput.name) {
            event.preventDefault();
            this.shiftSlide(1);
          }
        })
      }
    })
  }

  initEvents() {
    // User press the left mouse button
    let dragStart = (event) => {
      this.startPos = this.wrapper.offsetLeft;

      if (event.type === 'touchstart') {
        const touchStart = event;

        this.posX1 = touchStart.touches[0].clientX;
      } else if (event.type === 'mousedown') {
        const mouseDown = event;

        this.posX1 = mouseDown.clientX;
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', dragOut);
      }
    }

    // User move the mouse on the screen
    let dragOut = (event) => {
      if (event.type === 'touchmove') {
        const touchMove = event;

        this.posX2 = this.posX1 - touchMove.touches[0].clientX;
        this.posX1 = touchMove.touches[0].clientX;
      } else if (event.type === 'mousemove') {
        const mouseMove = event;

        this.posX2 = this.posX1 - mouseMove.clientX;
        this.posX1 = mouseMove.clientX;
      }

      this.wrapper.style.left = (this.wrapper.offsetLeft - this.posX2) + 'px';
    }

    // User release the left mouse button
    let dragEnd = ()  => {
      this.endPos = this.wrapper.offsetLeft;

      if (this.endPos - this.startPos < -this.limit) {
        this.shiftSlide(1, 'drag');
      } else if (this.endPos - this.startPos > this.limit) {
        this.shiftSlide(-1, 'drag');
      } else {
        this.wrapper.style.left = (this.startPos) + 'px';
      }

      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('mousemove', dragOut);
    }

    // Bind this in the handler functions
    dragStart = dragStart.bind(this);
    dragOut = dragOut.bind(this);
    dragEnd = dragEnd.bind(this);

    // Mouse events
    this.container.addEventListener('mousedown', dragStart);

    // Touch events
    this.container.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', dragOut);
    document.addEventListener('touchend', dragEnd);

    // Transition events
    this.container.addEventListener('transitionend', () => this.checkIndex());
  }

  hideButton() {
    if (this.index === 0) {
      if (this.prev) this.prev.classList.add('hide');
    } else if (this.index === this.slidesLength - 1) {
      if (this.next) this.next.classList.add('hide');
    } else {
      if (this.prev && this.prev.classList.contains('hide')) {
        this.prev.classList.remove('hide');
      }
      if (this.next && this.next.classList.contains('hide')) {
        this.next.classList.remove('hide');
      }
    }
  }

  shiftLimit() {
    if (this.index === -1) {
      this.wrapper.style.left = '0px';
      this.index = 0;
    } else if (this.index === this.slidesLength) {
      this.wrapper.style.left = -((this.slidesLength - 1) * this.slideSize) + 'px';
      this.index = this.slidesLength - 1;
    }
  }

  shiftSlide(dir, action) {
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

      if (!this.infinite) this.shiftLimit();
    }

    this.allowShift = false;
  }

  checkIndex() {
    this.wrapper.classList.remove('shifting');

    if (this.index === -1) {
      this.wrapper.style.left = -(this.slidesLength * this.slideSize) + 'px';
      this.index = this.slidesLength - 1;
    } else if (this.index === this.slidesLength) {
      this.wrapper.style.left = -(this.slideSize) + 'px';
      this.index = 0;
    }

    if (this.showPaging) this.updatePagingIndex();

    if (this.showButtons) this.hideButton();

    this.allowShift = true;

    let leftPosition = parseInt(this.wrapper.style.left);

    if (leftPosition < 0) leftPosition = -(leftPosition);
    if (leftPosition % this.slideSize !== 0) this.shiftPaging(this.index);
  }

  updatePagingIndex() {
    if (this.paging) {
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
  }

  shiftPaging(index) {
    this.wrapper.classList.add('shifting');

    if (this.infinite) {
      if (index !== 0) {
        this.wrapper.style.left = -((index + 1) * this.slideSize) + 'px';
      } else {
        this.wrapper.style.left = -(this.slideSize) + 'px';
      }
    } else {
      if (index !== 0) {
        this.wrapper.style.left = -(index * this.slideSize) + 'px';
      } else {
        this.wrapper.style.left = '0px';
      }
    }

    this.index = index;
    this.allowShift = false;
  }

  pagingBuilder() {
    for (let i = 0; i < this.slidesLength; i++) {
      const pagingItem = document.createElement("span");

      pagingItem.classList.add('index');
      if (i === 0) pagingItem.classList.add('active');

      pagingItem.addEventListener('click', () => {
        this.shiftPaging(i);
      });

      if (this.paging) {
        this.paging.insertAdjacentElement('beforeend', pagingItem);
      }
    }
  }
}

const slider = new Slider(
  {
    slidesToShow: 3,
    slidesToLoad: 5,
    showButtons: true,
    showPaging: true,
    infinite: false
  },
  {
    container: '#container',
    view: '#view',
    wrapper: '#wrapper',
    slides: '.slide',
  }
);

slider.initEvents();