/*******************************************
 * Real Estate Design 1 Script
 * *****************************************
 *
 * Author: Hicaliber
 * Author URL: hicaliber.com.au
 * 
 * Table of Contents:
 * - LP Box Layout 4
 * 
 ******************************************/

jQuery(document).ready(function($) {

   /*****************************
	# LP BOX LAYOUT 4 - START
	****************************
	* 
	* Slide up transition for lp box layout 4
	*/ 
   var element_item = $('.lp-element.lp-box-layout-4:not(.rep-review-element) .lp-box');

   element_item.each(function(e) {

      var element_height = $(this).find('.lp-content').outerHeight(true),
          element_padding = parseInt($(this).find('.lp-content').css('padding-top')),
          child_height = $(this).find('.lp-content > div').first().outerHeight(true);

      $(this).find('.lp-content > div').first().css('margin-bottom', element_padding+'px');

      var translate_height = element_height - element_padding - child_height;

      $(this).find('.lp-content').css('transform', 'translateY('+translate_height+'px)');
      $(this).hover(function(e) {
         $(this).find('.lp-content').css('transform', 'translateY(0)');
         e.stopPropagation();
      }, function(e) {
         $(this).find('.lp-content').css('transform', 'translateY('+translate_height+'px)');
         e.stopPropagation();
      });

   });
   /*****************************
	# LP BOX LAYOUT 4 - END
   *****************************/ 

});