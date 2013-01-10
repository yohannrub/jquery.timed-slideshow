# jQuery Timed Slideshow

jQuery Timed Slideshow is a lightweight jQuery slideshow plugin with timing animation controls and automatic pagination features.  
This plugin has available functions to go to a specific slide, play, pause and reset the internal timer.  
Its internal timer uses an actual timekeeping by polling current time (as use of `setInterval()` only is not fully reliable for actual timekeeping).  
It currently supports *slide* and *fade* transition effects.

[**Demo page**](http://yohannrub.github.com/jquery.timed-slideshow/)


## Usage

Put your list of slides inside a parent block element, and apply it the CSS class 'slideshow-slides' (by default, see *Options*).  
You can also add *prev* / *next* buttons and pagination elements by putting them inside the parent block element, and applying them specific CSS classes (see *Options*).  
Example:

```html
<div id="slideshow-container">
    <ul class="slideshow-slides">
        <li><img src="img/image1.jpg" /></li>
        <li><img src="img/image2.jpg" /></li>
        <li><img src="img/image3.jpg" /></li>
        <li><img src="img/image4.jpg" /></li>
    </ul>
    <div>
        <div class="slideshow-pagination"></div>
        <a class="slideshow-prev">Prev</a>
        <a class="slideshow-next">Next</a>
    </div>
</div>
```

You can then apply the slideshow functions to the parent block element:

```javascript
// Initialize the slideshow for #slideshow-container
$('#slideshow-container').slideshow();

// Will play the slideshow
$('#slideshow-container').slideshow('play');

// Will pause the timer of the current slide
$('#slideshow-container').slideshow('pause');

// Will reset the timer of the current slide
$('#slideshow-container').slideshow('reset');

// Will go to first slide (parameter can be any integer between 0 and [number of slides]-1)
$('#slideshow-container').slideshow('slide', 0);

// Will retrieve the current slide index (integer between 0 and [number of slides]-1)
var currentIndex = $('#slideshow-container').slideshow('getCurrentIndex');
```


## Options

Some options can be passed at initialization (the following values are defaults):

```javascript
// Initialize the slideshow for #slideshow-container with passed options
$('#slideshow-container').slideshow({
    autoPlay: true,                          // whether or not to auto-play at initialization
    duration: 5000,                          // duration of display of each slide, including transition (in ms)
    transitionDuration: 500,                 // duration of transition between each slide (in ms)
    transitionEffect: 'slide',               // effect of transition ('slide' or 'fade')
    transitionDirectionSlide: 'horizontal',  // direction of transition when using 'slide' effect ('horizontal' or 'vertical')
    transitionCrossfade: false,              // whether or not to crossfade when using 'fade' effect
    transitionStep: 1,                       // step of transition (positive or negative integer)
    transitionEasing: null,                  // easing of transition
    transitionStartCallback: function(){},   // function to be called at start of each transition
    transitionEndCallback: function(){},     // function to be called at end of each transition
    startIndex: 0,                           // index of the first slide to display
    slidesClass: 'slideshow-slides',         // CSS class of slides list element
    prevClass: 'slideshow-prev',             // CSS class of previous button element
    nextClass: 'slideshow-next',             // CSS class of next button element
    paginationClass: 'slideshow-pagination'  // CSS class of pagination container element
});
```


## Styling

**Note:**

* Always define a CSS width for slide list-items
* Either define a CSS height for slide list-items *containing images*, or preload images before slideshow initialization

The current active slide and pagination item elements can be styled using the 'active' CSS class.

```css
#slideshow-container .slideshow-slides .active {
  background-color: #ff0000;
}
#slideshow-container .slideshow-pagination ul li.active {
  background-color: #ff0000;
}
```
