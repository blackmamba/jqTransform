/*
 *
 * jqTransform
 * by mathieu vilaplana mvilaplana@dfc-e.com
 * Designer ghyslain armand garmand@dfc-e.com
 *
 *
 * Version 1.0 25.09.08
 * Version 1.1 06.08.09
 * Add event click on Checkbox and Radio
 * Auto calculate the size of a select element
 * Can now, disabled the elements
 * Correct bug in ff if click on select (overflow=hidden)
 * No need any more preloading !!
 * 
 * extended by: Hitesh Ubharani hiteshubharani@gmail.com
 * jqTransforms select only
 * Use: This is supposed to be executed once on the widget container, and it will transform all the selects.
 * This component fires change event on change, so subscribe to that to get notified.
 *  
 ******************************************** */
 
(function($){
  var defaultOptions = {preloadImg:true};
  var jqTransformImgPreloaded = false;

  var jqTransformPreloadHoverFocusImg = function(strImgUrl) {
    //guillemets to remove for ie
    strImgUrl = strImgUrl.replace(/^url\((.*)\)/,'$1').replace(/^\"(.*)\"$/,'$1');
    var imgHover = new Image();
    imgHover.src = strImgUrl.replace(/\.([a-zA-Z]*)$/,'-hover.$1');
    var imgFocus = new Image();
    imgFocus.src = strImgUrl.replace(/\.([a-zA-Z]*)$/,'-focus.$1');       
  };

  
  /***************************
    Labels
  ***************************/
  var jqTransformGetLabel = function(objfield){
    var selfForm = $(objfield.get(0).form);
    var oLabel = objfield.next();
    if(!oLabel.is('label')) {
      oLabel = objfield.prev();
      if(oLabel.is('label')){
        var inputname = objfield.attr('id');
        if(inputname){
          oLabel = selfForm.find('label[for="'+inputname+'"]');
        } 
      }
    }
    if(oLabel.is('label')){return oLabel.css('cursor','pointer');}
    return false;
  };
  
  /* Hide all open selects */
  var jqTransformHideSelect = function(oTarget){
    var ulVisible = $('.jqTransformSelectWrapper ul:visible');
    ulVisible.each(function(){
      var oSelect = $(this).parents(".jqTransformSelectWrapper:first").find("select").get(0);
      //do not hide if click on the label object associated to the select
      if( !(oTarget && oSelect.oLabel && oSelect.oLabel.get(0) == oTarget.get(0)) ){$(this).trigger('collapse');}
    });
  };
  /* Check for an external click, and hide the open select dropdowns */
  var jqTransformCheckExternalClick = function(event) {
    if ($(event.target).parents('.jqTransformSelectWrapper').length === 0) { jqTransformHideSelect($(event.target)); }
  };

  /* Apply document listener */
  var jqTransformAddDocumentListener = function (){
    $(document).mousedown(jqTransformCheckExternalClick);
  };  
      
  /* Add a new handler for the reset action */
  var jqTransformReset = function(f){
    var sel;
    $('.jqTransformSelectWrapper select', f).each(function(){sel = (this.selectedIndex<0) ? 0 : this.selectedIndex; $('ul', $(this).parent()).each(function(){$('a:eq('+ sel +')', this).click();});});
    // $('a.jqTransformCheckbox, a.jqTransformRadio', f).removeClass('jqTransformChecked');
    // $('input:checkbox, input:radio', f).each(function(){if(this.checked){$('a', $(this).parent()).addClass('jqTransformChecked');}});
  };


  
  /***************************
    Select 
   ***************************/ 
  $.fn.jqTransSelect = function(){
    if (this.length) {
      this.each(function(index){
        var $select = $(this);

        if($select.hasClass('jqTransformHidden') || $select.attr('multiple')) return;

        var oLabel  =  jqTransformGetLabel($select);
        /* First thing we do is Wrap it */
        var $wrapper = $select
          .addClass('jqTransformHidden')
          .wrap('<div class="jqTransformSelectWrapper"></div>')
          .parent()
          .css({zIndex: 99-index})
        ;
        
        /* Now add the html for the select */
        $wrapper.prepend('<div><span></span><a href="#" class="jqTransformSelectOpen"></a></div><ul></ul>');
        var $ul = $('ul', $wrapper).css('width',$select.width()).hide();
        /* Now we add the options */
        $('option', this).each(function(i){
          var oLi = $('<li><a href="#" index="'+ i +'">'+ $(this).html() +'</a></li>');
          $ul.append(oLi);
        });
        
        /* Call instead of $ul.hide() to return state to normal */
        $ul.bind('collapse', function(){
          $(this).hide();
          var $clone = $wrapper.data('clone');
          if ($clone) {
            $wrapper.attr('style', $clone.attr('style'));
            $clone.hide();
            $wrapper.insertAfter($clone);
          }
        });

        /* Add click handler to the a */
        $ul.find('a').click(function(){
          $('a.selected', $wrapper).removeClass('selected');
          $(this).addClass('selected'); 
          var prevIndex = $select[0].selectedIndex;
          $select[0].selectedIndex = $(this).attr('index');
          /* Fire the onchange event */
          if(prevIndex != $select[0].selectedIndex)
            $select.change();
          $('span:eq(0)', $wrapper).html($(this).html());
          $ul.trigger('collapse');
          return false;
        });

        /* Set the default */
        $('a:eq('+ this.selectedIndex +')', $ul).click();
        var oLinkOpen = $("a.jqTransformSelectOpen",$wrapper)
        $('span:first', $wrapper).click(function(){oLinkOpen.trigger('click');});
        oLabel && oLabel.click(function(){oLinkOpen.trigger('click');});
        this.oLabel = oLabel;
        
        /* Apply the click handler to the Open */
        oLinkOpen
          .click(function(){

            var already_open = $ul.is(':visible');
            jqTransformHideSelect(); // Toggle closed or close other selects.

            if( !already_open ) {
            
              if($select.attr('disabled')){return false;}

              // Calculate width every time to adjust for any DOM changes
              $ul.css({width: ($wrapper.width() - oLinkOpen.width() - 1)+'px'});
              $ul.slideToggle('fast', function(){         
                var offSet = ($('a.selected', $ul).offset().top - $ul.offset().top);
                $ul.animate({scrollTop: offSet});
              });
            
              if (!$wrapper.data('clone')) {
                var $clone = $wrapper.clone()
                  .hide()
                  .insertBefore($wrapper);
                $wrapper.data('clone',$clone);
              } else {
                var $clone = $wrapper.data('clone');
              }
          
              $clone.show();
              $wrapper
                .appendTo('body')
                .css({
                  position: 'absolute',
                  top: $clone.offset().top,
                  left: $clone.offset().left,
                  width: $clone.width()+'px',
                  height: $clone.height()+'px'
                })
              ;
            } 
            return false;
          })
        ;

        // Set the new width
        var iSelectWidth = $select.outerWidth();
        var oSpan = $('span:first',$wrapper);
        var newWidth = (iSelectWidth > oSpan.innerWidth())?iSelectWidth+oLinkOpen.outerWidth():$wrapper.width();
        $wrapper.css({width: newWidth});
      
        // Calculate the height if necessary, less elements that the default height
        //show the ul to calculate the block, if ul is not displayed li height value is 0
        $ul.css({display:'block',visibility:'hidden'});
        if ($ul.is(':hidden')) {
          var hidden_containers = $($ul.parentsUntil(':visible').get().reverse());
          hidden_containers.each(function(){
            var $this = $(this)
            if ($this.is(':hidden')) {
              $this.data('style', $this.attr('style') || false);
              $this.css({
                position: 'absolute',
                left: '-10000px',
                display: 'block'
              });
            }
          });
        }
        var iSelectHeight = ($('li',$ul).length)*($('li:first',$ul).height());//+1 else bug ff
        (iSelectHeight < $ul.height()) && $ul.css({height:iSelectHeight,'overflow':'hidden'});//hidden else bug with ff
        $ul.css({display:'none',visibility:'visible'});
        if (hidden_containers) hidden_containers.each(function(){
          var $this = $(this);
          if (typeof $this.data('style') != 'undefined')
            $this.attr('style', $this.data('style') || '');
        });
        
      });

      jqTransformAddDocumentListener();
    }
    return this;
  };

  $.fn.jqTransformSelect = function(options){
    var opt = $.extend({},defaultOptions,options);
    
    /* each form */
    return this.each(function(){
		var selfForm = $(this);
		if(selfForm.hasClass('jqtransformdone')) {return;}
		selfForm.addClass('jqtrans0formdone');
	      
	     // $('input:submit, input:reset, input[type="button"]', this).jqTransInputButton();      
	     // $('input:text, input:password', this).jqTransInputText();     
	      // $('input:checkbox', this).jqTransCheckBox();
	      // $('input:radio', this).jqTransRadio();
	      // $('textarea', this).jqTransTextarea();
		$('select', this).jqTransSelect()
	
	    selfForm.bind('reset', function() {
		    var action = function() {
				jqTransformReset(this);
			};
			window.setTimeout(action, 10);
		});
      
    }); /* End Form each */
        
  };/* End the Plugin */

})(jQuery);
           