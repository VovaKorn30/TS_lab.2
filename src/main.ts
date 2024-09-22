import $ from 'jquery';

// Define breakpoints.
const breakpoints = (config: { [key: string]: [string | null, string | null] }) => {
  // Your breakpoints logic here (based on your library or custom implementation).
};

// Extend JQuery with breakpoints
interface JQuery {
  on: (event: string, handler: (event?: Event) => void) => this;
}

(($: JQueryStatic) => {
  const $window = $(window);
  const $body = $('body');
  const $wrapper = $('#wrapper');

  // Breakpoints
  breakpoints({
    xlarge: ['1281px', '1680px'],
    large: ['981px', '1280px'],
    medium: ['737px', '980px'],
    small: ['481px', '736px'],
    xsmall: [null, '480px']
  });

  // Hack: Enable IE workarounds.
  if (navigator.userAgent.includes('MSIE') || navigator.userAgent.includes('Trident')) {
    $body.addClass('ie');
  }

  // Touch?
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    $body.addClass('touch');
  }

  // Transitions supported?
  if (CSS.supports('transition', 'all')) {
    // Play initial animations on page load.
    $window.on('load', () => {
      setTimeout(() => {
        $body.removeClass('is-preload');
      }, 100);
    });

    // Prevent transitions/animations on resize.
    let resizeTimeout: number | undefined;
    $window.on('resize', () => {
      clearTimeout(resizeTimeout);
      $body.addClass('is-resizing');
      resizeTimeout = setTimeout(() => {
        $body.removeClass('is-resizing');
      }, 100);
    });
  }

  // Scroll back to top.
  $window.scrollTop(0);

  // Panels.
  const $panels = $('.panel');

  $panels.each(function () {
    const $this = $(this);
    const $toggles = $(`[href="#${$this.attr('id')}"]`);
    const $closer = $('<div class="closer" />').appendTo($this);

    // Closer.
    $closer.on('click', (event) => {
      $this.trigger('---hide');
    });

    // Events.
    $this
      .on('click', (event) => {
        event.stopPropagation();
      })
      .on('---toggle', () => {
        if ($this.hasClass('active')) {
          $this.triggerHandler('---hide');
        } else {
          $this.triggerHandler('---show');
        }
      })
      .on('---show', () => {
        if ($body.hasClass('content-active')) {
          $panels.trigger('---hide');
        }

        $this.addClass('active');
        $toggles.addClass('active');
        $body.addClass('content-active');
      })
      .on('---hide', () => {
        $this.removeClass('active');
        $toggles.removeClass('active');
        $body.removeClass('content-active');
      });

    // Toggles.
    $toggles
      .removeAttr('href')
      .css('cursor', 'pointer')
      .on('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        $this.trigger('---toggle');
      });
  });

  // Global events.
  $body.on('click', (event) => {
    if ($body.hasClass('content-active')) {
      event.preventDefault();
      event.stopPropagation();
      $panels.trigger('---hide');
    }
  });

  $window.on('keyup', (event) => {
    if (event.key === 'Escape' && $body.hasClass('content-active')) {
      event.preventDefault();
      event.stopPropagation();
      $panels.trigger('---hide');
    }
  });

  // Header.
  const $header = $('#header');

  // Links.
  $header.find('a').each(function () {
    const $this = $(this);
    const href = $this.attr('href');

    // Internal link? Skip.
    if (!href || href.charAt(0) === '#') return;

    // Redirect on click.
    $this
      .removeAttr('href')
      .css('cursor', 'pointer')
      .on('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = href;
      });
  });

  // Footer.
  const $footer = $('#footer');

  // Copyright.
  $footer.find('.copyright').each(function () {
    const $this = $(this);
    const $parent = $this.parent();
    const $lastParent = $parent.parent().children().last();

    breakpoints.on('<=medium', () => {
      $this.appendTo($lastParent);
    });

    breakpoints.on('>medium', () => {
      $this.appendTo($parent);
    });
  });

  // Main.
  const $main = $('#main');

  // Thumbs.
  $main.children('.thumb').each(function () {
    const $this = $(this);
    const $image = $this.find('.image');
    const $image_img = $image.children('img');

    // No image? Bail.
    if ($image.length === 0) return;

    // Set background.
    $image.css('background-image', `url(${$image_img.attr('src')})`);

    // Set background position.
    const x = $image_img.data('position');
    if (x) $image.css('background-position', x);

    // Hide original img.
    $image_img.hide();
  });

  // Poptrox.
  $main.poptrox({
    baseZIndex: 20000,
    caption: ($a: JQuery) => {  // Add type for parameter $a
      let s = '';
      $a.nextAll().each(function () {
        s += this.outerHTML;
      });
      return s;
    },
    fadeSpeed: 300,
    onPopupClose: () => $body.removeClass('modal-active'),
    onPopupOpen: () => $body.addClass('modal-active'),
    overlayOpacity: 0,
    popupCloserText: '',
    popupHeight: 150,
    popupLoaderText: '',
    popupSpeed: 300,
    popupWidth: 150,
    selector: '.thumb > a.image',
    usePopupCaption: true,
    usePopupCloser: true,
    usePopupDefaultStyling: false,
    usePopupForceClose: true,
    usePopupLoader: true,
    usePopupNav: true,
    windowMargin: 50
  });

  // Hack: Set margins to 0 when 'xsmall' activates.
  breakpoints.on('<=xsmall', () => {
    ($main[0] as any)._poptrox.windowMargin = 0; // Keep 'as any' if type definitions for poptrox are unavailable.
  });

  breakpoints.on('>xsmall', () => {
    ($main[0] as any)._poptrox.windowMargin = 50; // Keep 'as any' if type definitions for poptrox are unavailable.
  });

})(jQuery as any);
