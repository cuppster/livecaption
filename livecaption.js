/*

livecaption v0.1
Copyright © 2011 Jason Cupp / Cuppster.com
http://cuppster.com

Requires jQuery 1.4 or newer

Thanks to:
* http://css-tricks.com/7405-adding-stroke-to-web-text/
* http://jsfiddle.net/kovalchik/yJff9/
* http://api.jquery.com/load-event/

License:
MIT License - http://www.opensource.org/licenses/mit-license.php

Enjoy!

*/
(function ($) {
  'use strict';
  
  $.fn.captionline = function(options) {

    var settings = {
      target            : false,
      maxWidth          : 300,
      maxFont           : 30,
      minFont           : 8,
      wrap              : false,
      fontSize          : 12,
      defaultText       : false,
      canEdit           : true,
      isCenter          : true,
      forceUpper        : true,
      doAnimate         : true,
      animatePause      : 200,
      animateDuration   : 'fast',
      position          : 'top'
    };
    $.extend( settings, options );
    
    // resize event
    var EVENT_RESIZE = 'CL_resize';
    
    // setup target and source
    //
    var target = null;
    var source = null;        
    if (!settings.target) {
      target = this;
    }
    else {
      target = $(settings.target);
      source = this;
    }

    // set base-image width and record its height
    //
    var imageHeight;
    target.parent().children("IMG").first().load(function() {
      $(this).css('width', settings.maxWidth);
      imageHeight = $(this).height();          
      // special handling for 'bottom'
      if ('bottom' == settings.position) {   
        target.bind(EVENT_RESIZE, function() {
          var targetHeight = target.height();
          target.css('top', (imageHeight - targetHeight) + 'px');
        });
      }          
    /* workaround/hack for images already in the cache for IE; see: http://api.jquery.com/load-event/ */
    })
    .each(function(){
      if(this.complete) $(this).trigger("load");
    });
   
    // give target some style
    //
    target.addClass('CL_caption');
    target.css('left',         0);
    target.css('position',     'absolute');
    
    // specific to bottom
    if ('top' == settings.position) {
      target.css        ('top',          0); 
      target.addClass   ('CL_top');
    }
    else if ('bottom' == settings.position) {
      target.addClass   ('CL_bottom');
    }
    
    // give parent some style
    //
    target.parent().css('position',     'relative');
    target.parent().css('width',         settings.maxWidth);
    target.parent().css('overflow',     'hidden');
    
    // create wrapper
    //
    target.wrap('<div style="width:' + settings.maxWidth + 'px;" class="CL_wrap"/>');
    
    // wrap settings
    //
    target.css('white-space', settings.wrap ? 'normal' : 'nowrap');  
    
    // font settings
    //
    target.css    ('font-size', settings.fontSize + 'pt'); 
    target.attr   ('fontsize',  settings.fontSize);
    
    // setup default text
    if (settings.defaultText) {
      updateField(settings.defaultText);
    }
    
    // timer variable
    var pauseTimer = null;
    
    // bind keyup event if editable
    //
    if (settings.canEdit || settings.target) {
      this.keyup(function(event) {
        return updateField(false);  
      });     
    }
    
    function updateTimer() {
      if (settings.isCenter)
        pauseTimer = setTimeout(center, settings.animatePause);
    }
    
    function center() {
      var width = target.width();
      var x = parseInt((settings.maxWidth - width) / 2);
      if (pauseTimer) clearTimeout(pauseTimer);
      if (settings.doAnimate) {
        target.animate({left : x}, {duration: settings.animateDuration,});
      }
      else {
        target.css('left', x + 'pt'); 
      }
    }
    
    function updateField(text) {
    
      if (pauseTimer) clearTimeout(pauseTimer);
      updateTimer();
      
      if (!text)
        text = source.val();
      
      if (settings.forceUpper)
        text = text.toUpperCase();
        
      // put new text into sizeme span
      target.text(text);
     
      var fontsize = 0;    
      var didMax = -1;
      var didMin = 10000;
      
      for (;;) {
       
        var width = target.width();
        //console.log("checking width = " + width);
          
        if (settings.maxWidth < width ) {
        
          //console.log("reducing check ...");
          
          fontsize = target.attr('fontsize');
          //console.log("prev font size = " + fontsize);
          
          // dec
          if (didMax < fontsize)
            didMax = fontsize;
          fontsize--;
          
          if (fontsize < settings.minFont)
            break;
          
          //console.log   ("reducing...");
          target.attr     ('fontsize',  fontsize);
          target.css      ('font-size', fontsize + 'pt');
          target.trigger  (EVENT_RESIZE);
          
          if (fontsize == didMin ) // been here before, return here
            break;
        }
        else {
        
          //console.log("expanding?...");
          
          var fontsize = target.attr('fontsize');
          //console.log("prev font size = " + fontsize);

          if (fontsize < didMin)
            didMin = fontsize;
            
          fontsize++;
          
          if (fontsize == didMax || settings.maxFont <= fontsize) {
            target.trigger  (EVENT_RESIZE);
            break;
          }
          
          //console.log   ("expanding...");
          target.attr     ('fontsize',  fontsize);
          target.css      ('font-size', fontsize + 'pt');
          target.trigger  (EVENT_RESIZE);              
        }            
      }
      
      // bubble event
      return true;
    };

    // chainability
    return this;        
  };
})(jQuery);
