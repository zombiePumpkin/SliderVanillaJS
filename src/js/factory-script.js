yv = {};

// Main class
yv.slider = {
  // Parameters
  slidesToShow: 1,
  slidesToShift: 1,
  slidesToLoad: 1,
  showButtons: false,
  showPaging: false,
  infinite: false,
  container: 'undefined',
  view: 'undefined',
  wrapper: 'undefined',
  slides: [],
  index: 0,
  posX1: 0,
  posX2: 0,
  startPos: 0,
  endPos: 0,
  limit: 50,
  allowShift: true,
  // Functions
  // Init slider configs
  initConfig: function(options, sliderElements) {
    // Slider config options
    this.slidesToShow = options.slidesToShow;
    this.slidesToShift = options.slidesToShift || 1;
    this.slidesToLoad = options.slidesToLoad;
    this.showButtons = options.showButtons;
    this.showPaging = options.showPaging;
    this.infinite = options.infinite;

    // Main slider elements
    this.container = document.querySelector(sliderElements.container);
    this.view = document.querySelector(sliderElements.view);
    this.wrapper = document.querySelector(sliderElements.wrapper);
    this.slides = this.wrapper.querySelectorAll(sliderElements.slides);

    // Main slider element properties
    this.slideSize = (
      Number(getComputedStyle(this.slides[0]).marginLeft.replace('px', '')) +
      Number(getComputedStyle(this.slides[0]).marginRight.replace('px', '')) +
      Number(getComputedStyle(this.slides[0]).width.replace('px', ''))
    );
    
    // Set the total amount of slides
    this.slidesLength = this.slides.length;

    // Set the total size of the wrapper
    this.wrapper.style.width = String(this.slideSize * this.slidesToLoad) + 'px';

    // Set the max number of slides to load
    if (!isNaN(this.slidesToLoad) && this.slidesToLoad !== null) {
      if (this.slidesToLoad <= this.slidesLength) {
        for (let i = 0; i < this.slidesLength; i++) {
          if (i >= this.slidesToLoad) this.slides[i].remove();
        }
        this.slidesLength = this.slidesToLoad;
      }
    }

    // Set initial position of the slider
    this.wrapper.style.left = '0px';

    // Adjusting the size of the view
    this.view.style.width = (this.slideSize * this.slidesToShow) + 'px';

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

      // Insert paging in the slider container
      this.container.insertAdjacentElement('beforeend', this.paging);

      // Init paging items and click events
      this.pagingBuilder();
    }

    // Slider is loaded
    this.container.classList.add('loaded');
  },
  // Fix problems with keyboard events
  initKeysEvents(...elementNames) {
    // Fix the tab press on the end of inputs inside forms inside the slider
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
  },
  // Init drag events with mouse tochscreen
  initDragEvents() {
    // Event triggered on press the left mouse button/touch the screen
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
    // Event triggered on move the mouse/finger across the screen
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

    // Event triggered when user release the mouse button/finger from the screen
    let dragEnd = () => {
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
  },
  // Hide slider buttons on the screen depending on position
  hideButton: function() {
    if (!this.infinite) {
      if (this.index === 0) {
        if (this.prev) this.prev.classList.add('hide');

      } else if (this.index + this.slidesToShift >= this.slidesLength) {
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
  },
  // Prevents the slider from going over the limit
  shiftLimit: function() {
    if (this.infinite) {
      if (this.index < 0) {
        if (this.slidesLength % this.slidesToShift !== 0) {
          this.wrapper.style.left = -(
            (this.slidesLength - (this.slidesLength % this.slidesToShift)) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - (this.slidesLength % this.slidesToShift);
        } else {
          this.wrapper.style.left = -(
            (this.slidesLength - this.slidesToShift) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - this.slidesToShift;
        }
      } else if (this.index >= this.slidesLength) {
        this.wrapper.style.left = '0px';
        this.index = 0;
      }
    } else {
      if (this.index < 0) {
        this.wrapper.style.left = '0px';
        this.index = 0;
      } else if (this.index >= this.slidesLength) {
        if (this.slidesLength % this.slidesToShift !== 0) {
          this.wrapper.style.left = -(
            (this.slidesLength - (this.slidesLength % this.slidesToShift)) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - (this.slidesLength % this.slidesToShift);
        } else {
          this.wrapper.style.left = -(
            (this.slidesLength - this.slidesToShift) * this.slideSize
          ) + 'px';

          this.index = this.slidesLength - this.slidesToShift;
        }
      }
    }
  },
  // Change the slider depending on the drag/click button event
  shiftSlide: function(dir, action) {
    this.wrapper.classList.add('shifting');

    if (this.allowShift) {
      if (!action) { this.startPos = this.wrapper.offsetLeft; }

      if (dir === 1) {
        this.wrapper.style.left = (
          this.startPos - (this.slideSize * this.slidesToShift)
        ) + 'px'
        this.index += this.slidesToShift;
      } else if (dir === -1) {
        this.wrapper.style.left = (
          this.startPos + (this.slideSize * this.slidesToShift)
        ) + 'px';
        this.index -= this.slidesToShift;
      }
    }

    this.allowShift = false;

    this.shiftLimit();
  },
  // Event triggered after slide animations
  checkIndex() {
    this.wrapper.classList.remove('shifting');

    if (this.showPaging) this.updatePagingIndex();

    if (this.showButtons) this.hideButton();

    const leftPosition = parseInt(this.wrapper.style.left);
    
    if (leftPosition % this.slideSize !== 0) this.shiftPaging(this.index);
    
    this.allowShift = true;
  },
  // Update index when pass sliders
  updatePagingIndex() {
    if (this.paging) {
      this.paging.querySelectorAll('.index').forEach((element, index) => {
        const elementIndex = Number(
          element.classList.toString().replace(/\D/g, '')
        );
        
        if (elementIndex === this.index) {
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
  },
  // Event triggered on click the paging buttons
  shiftPaging(index) {
    this.wrapper.classList.add('shifting');

    if (index < 0 && this.infinite) {
      index = this.slidesLength - 1;
    } else if (index >= this.slidesLength && this.infinite) {
      index = 0;
    } else if (index < 0) {
      index = 0;
    } else if (index >= this.slidesLength) {
      index = this.slidesLength - 1;
    }

    this.wrapper.style.left = -(index * this.slideSize) + 'px';

    this.index = index;
    this.allowShift = false;
  },
  // Create paging ordenation & insert on the slider container
  pagingBuilder() {
    for (let i = 0; i < this.slidesLength; i++) {
      if (i % this.slidesToShift === 0) {
        const pagingItem = document.createElement("span");
        
        pagingItem.classList.add('index');
        pagingItem.classList.add(i);
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
}

yv.slider.initConfig(
  {
    slidesToShow: 3,
    slidesToShift: 3,
    slidesToLoad: 9,
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

yv.slider.initDragEvents();
