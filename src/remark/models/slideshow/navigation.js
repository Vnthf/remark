module.exports = Navigation;

function Navigation (events) {
  var self = this
    , currentSlideIndex = -1
    , started = null
    ;

  var prevScrollValue,
      SCROLL_INTERVAL = 30,
      PAGE_SCROLL_INTERVAL = 300,
      PAGE_SCROLL_ANIMATION_TIME = 500,
      RENDER_SCROLL_DOWN_CARET_TIME = 1000;

  self.getCurrentSlideIndex = getCurrentSlideIndex;
  self.gotoSlide = gotoSlide;
  self.gotoPreviousSlide = gotoPreviousSlide;
  self.gotoNextSlide = gotoNextSlide;
  self.gotoFirstSlide = gotoFirstSlide;
  self.gotoLastSlide = gotoLastSlide;
  self.pause = pause;
  self.resume = resume;

  events.on('gotoSlide', gotoSlide);
  events.on('gotoPreviousSlide', gotoPreviousSlide);
  events.on('gotoNextSlide', gotoNextSlide);
  events.on('gotoFirstSlide', gotoFirstSlide);
  events.on('gotoLastSlide', gotoLastSlide);
  events.on('scrollDown', scrollDown);
  events.on('scrollUp', scrollUp);

  events.on('slidesChanged', function () {
    if (currentSlideIndex > self.getSlideCount()) {
      currentSlideIndex = self.getSlideCount();
    }
  });

  events.on('createClone', function () {
    if (!self.clone || self.clone.closed) {
      self.clone = window.open(location.href, self.getCloneTarget(), 'location=no');
    }
    else {
      self.clone.focus();
    }
  });

  events.on('resetTimer', function() {
    started = false;
  });

  events.on('afterShowSlide', function (slide) {
    showScrollDownCaret();

    if(self.getSlides()[slide].properties.count === 'false' && prevScrollValue && prevScrollValue > 0) {
      scroll(prevScrollValue);
      scroll(PAGE_SCROLL_INTERVAL, true);
    }
    if(self.getSlides()[slide].properties.count === undefined) {
      prevScrollValue = 0;
    }
  });

  function pause () {
    events.emit('pause');
  }

  function resume () {
    events.emit('resume');
  }

  function getCurrentSlideIndex () {
    return currentSlideIndex;
  }

  function gotoSlideByIndex(slideIndex, noMessage) {
    var alreadyOnSlide = slideIndex === currentSlideIndex
      , slideOutOfRange = slideIndex < 0 || slideIndex > self.getSlideCount()-1
      ;

    if (noMessage === undefined) noMessage = false;

    if (alreadyOnSlide || slideOutOfRange) {
      return;
    }

    if (currentSlideIndex !== -1) {
      events.emit('hideSlide', currentSlideIndex, false);
    }

    // Use some tri-state logic here.
    // null = We haven't shown the first slide yet.
    // false = We've shown the initial slide, but we haven't progressed beyond that.
    // true = We've issued the first slide change command.
    if (started === null) {
      started = false;
    } else if (started === false) {
      // We've shown the initial slide previously - that means this is a
      // genuine move to a new slide.
      events.emit('start');
      started = true;
    }

    events.emit('showSlide', slideIndex);

    currentSlideIndex = slideIndex;

    events.emit('slideChanged', slideIndex + 1);

    if (!noMessage) {
      if (self.clone && !self.clone.closed) {
        self.clone.postMessage('gotoSlide:' + (currentSlideIndex + 1), '*');
      }

      if (window.opener) {
        window.opener.postMessage('gotoSlide:' + (currentSlideIndex + 1), '*');
      }
    }
  }

  function gotoSlide (slideNoOrName, noMessage) {
    var slideIndex = getSlideIndex(slideNoOrName);

    gotoSlideByIndex(slideIndex, noMessage);
  }

  function gotoPreviousSlide() {
    scroll(0);
    gotoSlideByIndex(currentSlideIndex - 1);
  }

  function gotoNextSlide() {
    if(!isScrollBottom()) {
      scroll(PAGE_SCROLL_INTERVAL, true);
    } else {
      gotoSlideByIndex(currentSlideIndex + 1);
    }
    setTimeout(showScrollDownCaret, RENDER_SCROLL_DOWN_CARET_TIME);
  }

  function gotoFirstSlide () {
    gotoSlideByIndex(0);
  }

  function gotoLastSlide () {
    gotoSlideByIndex(self.getSlideCount() - 1);
  }

  function getSlideIndex (slideNoOrName) {
    var slideNo
      , slide
      ;

    if (typeof slideNoOrName === 'number') {
      return slideNoOrName - 1;
    }

    slideNo = parseInt(slideNoOrName, 10);
    if (slideNo.toString() === slideNoOrName) {
      return slideNo - 1;
    }

    if(slideNoOrName.match(/^p\d+$/)){
      events.emit('forcePresenterMode');
      return parseInt(slideNoOrName.substr(1), 10)-1;
    }

    slide = self.getSlideByName(slideNoOrName);
    if (slide) {
      return slide.getSlideIndex();
    }

    return 0;
  }

  //From hou: scroll관련 이벤트 추가
  function scrollUp () {
    scroll(-SCROLL_INTERVAL);
  }

  function scrollDown () {
    scroll(SCROLL_INTERVAL);
  }

  function scroll(val, isAnimate) {
    var $activeSlide = $(".remark-visible .remark-slide-content"),
      currentScrollVal = $activeSlide.scrollTop();
    if($activeSlide.queue('fx').length > 0) {
      $activeSlide.clearQueue();
      $activeSlide.scrollTop(currentScrollVal + val);
    }
    if(isAnimate) {
      $activeSlide.animate({
        scrollTop: currentScrollVal + val
      }, PAGE_SCROLL_ANIMATION_TIME);
    } else {
      $activeSlide.scrollTop(currentScrollVal + val);
    }
    prevScrollValue = currentScrollVal + val;
    return $activeSlide;
  }

  function showScrollDownCaret() {
    var $activeSlide = $(".remark-visible .remark-slide-content");
    var $caret = $activeSlide.find('.caret');
    $caret.hide();
    if(!isScrollBottom()) {
      if($caret.length === 0){
        $(".remark-visible .remark-slide-number").after(
          '<span class="caret"></span>'
        );
      }
      $caret.show();
    }
  }

  function isScrollBottom () {
    var $activeSlide = $(".remark-visible .remark-slide-content");
    return $activeSlide.scrollTop() + $activeSlide.outerHeight() >= $activeSlide[0].scrollHeight;
  }
}
