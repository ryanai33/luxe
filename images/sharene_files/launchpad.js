/*******************************************
 * Launchpad Core Script
 * *****************************************
 * A collection of custom jQuery extensions for various UI components.
 *
 * Author: Hicaliber
 * Author URL: hicaliber.com.au
 * 
 * Table of Contents:
 * - Launchpad Loader
 * - jQuery Extensions
 *   - Accordion
 *   - Tab
 *   - Modal
 *   - Read More Link
 *   - Carousel
 *	 - Post Selector Field
 *   - Google Address Lookup Field
 *   - Map
 * - Google Map Callback
 * 
 ******************************************/

/*****************************
 # Launchpad Loader - START
 * ***************************
 * 
 * A simple JavaScript library for managing hooks and filters.
 * 
 * @returns {Object} An object containing methods for adding, removing, and executing hooks and filters.
 */
var lpLoader = (function() {
    var hooks = {};

    /**
     * Add an action callback to a specific hook.
     *
     * @param {string} hookName - The name of the hook.
     * @param {Function} callback - The callback function to be executed.
     * @param {number} [priority=10] - The priority of the callback. Lower values execute first.
     * @param {number} [acceptedArgs=1] - The number of arguments accepted by the callback.
     */
    function addAction(hookName, callback, priority = 10, acceptedArgs = 1) {
        if (!hooks[hookName]) {
            hooks[hookName] = [];
        }

        hooks[hookName].push({
            callback: callback,
            priority: priority,
            acceptedArgs: acceptedArgs
        });

        // Sort the callbacks by priority
        hooks[hookName].sort(function(a, b) {
            return a.priority - b.priority;
        });
    }

    /**
     * Remove an action callback from a specific hook.
     *
     * @param {string} hookName - The name of the hook.
     * @param {Function} callback - The callback function to be removed.
     */
    function removeAction(hookName, callback) {
        if (hooks[hookName]) {
            hooks[hookName] = hooks[hookName].filter(function(action) {
                return action.callback !== callback;
            });
        }
    }

    /**
     * Execute all action callbacks associated with a specific hook.
     *
     * @param {string} hookName - The name of the hook.
     * @param {...*} args - Arguments to be passed to the action callbacks.
     */
    function doAction(hookName, ...args) {
        if (hooks[hookName]) {
            hooks[hookName].forEach(function(action) {
                action.callback(...args.slice(0, action.acceptedArgs));
            });
        }
    }

    /**
     * Add a filter callback to a specific hook.
     * Alias for addAction() method.
     *
     * @param {string} hookName - The name of the hook.
     * @param {Function} callback - The callback function to be executed.
     * @param {number} [priority=10] - The priority of the callback. Lower values execute first.
     * @param {number} [acceptedArgs=1] - The number of arguments accepted by the callback.
     */
    function addFilter(hookName, callback, priority = 10, acceptedArgs = 1) {
        addAction(hookName, callback, priority, acceptedArgs);
    }

    /**
     * Remove a filter callback from a specific hook.
     * Alias for removeAction() method.
     *
     * @param {string} hookName - The name of the hook.
     * @param {Function} callback - The callback function to be removed.
     */
    function removeFilter(hookName, callback) {
        removeAction(hookName, callback);
    }

    /**
     * Apply a series of filter callbacks to a value.
     *
     * @param {string} hookName - The name of the hook.
     * @param {*} value - The value to be filtered.
     * @param {...*} args - Arguments to be passed to the filter callbacks.
     * @returns {*} The filtered value.
     */
    function applyFilter(hookName, value, ...args) {
        if (hooks[hookName]) {
            hooks[hookName].forEach(function(action) {
                value = action.callback(value, ...args.slice(0, action.acceptedArgs - 1));
            });
        }

        return value;
    }

    return {
        addAction: addAction,
        removeAction: removeAction,
        doAction: doAction,
        addFilter: addFilter,
        removeFilter: removeFilter,
        applyFilter: applyFilter
    };
})();
/*****************************
 ! Launchpad Loader - END
 * **************************/

/*****************************
 # jQuery Extensions - START
 * **************************
 * 
 * jQuery extensions for creating the following methods:
 * 
 * - Accordion
 * - Tab
 * - Modal
 * - Read More Link
 * - Carousel
 * - Google Address Lookup Field
 * - Map
 * 
 */
(function($) {

    // Detect mobile keyboard state
    let lpKeyboardOpen = false;

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function () {
            lpKeyboardOpen = window.visualViewport.height < window.innerHeight;
        });
    }
	
	/**
     * Public modal API
     * 
     * Allows programmatic opening of LP modals.
     *
     * @param {string} modalId
     */
    window.lpOpenModal = function (modalId) {
        const modal = $('#' + modalId);

        if (!modal.length) {
            console.warn('lpOpenModal: modal not found', modalId);
            return;
        }

		if (modal.length) {
			const close_btn = modal.find('[data-lp-modal-close]');

			if (!close_btn.length) {
				modal.find('.lp-modal-content').append(
					'<button class="lp-modal-close-button" data-lp-modal-close type="button">\
					<span>&times;</span>\
				</button>'
				);
			}
		}
        modal.attr('aria-active', true);

        if (modal.attr('data-lp-inline-modal') !== undefined) {
            modal.addClass('lp-modal');
        } else {
            modal.css('display', 'block');
        }
    };
	
    $.fn.extend({
		
		/**
		 * Back Button
		 *
		 * jQuery extension for handling back navigation.
		 * Uses browser history to navigate back when triggered.
		 *
		 * Usage:
		 * $('.lp-back-button').lpBackButton();
		 *
		 * Markup notes:
		 * - Add `.ignore-history` to disable history.back()
		 * - Add `.tailored-range` to bypass this handler
		 */
        lpBackButton : function(args={}){
            const settings = $.extend({
				preventDefault: true
			}, args);

			return this.each(function () {

				const $button = $(this);

				// Avoid double binding
				$button.off('click.lpBackButton').on('click.lpBackButton', function (e) {

					if ($button.is('.tailored-range, .ignore-history')) {
                        return;
                    }

                    if (settings.preventDefault) {
                        e.preventDefault();
                    }

                    const href        = $button.attr('href');
                    const fallbackUrl = $button.data('fallback-url');
                    const referrer = document.referrer;

                    // Only use history if it's actually usable
                    if (referrer && window.history.length > 1) {
                        try {
                            const refUrl = new URL(referrer);
                            if (refUrl.origin === window.location.origin) {
                                window.history.back();
                                return;
                            }
                        } catch (e) {}
                    }

                    // Fallback URL (primary safety net)
                    if (fallbackUrl) {
                        window.location.href = fallbackUrl;
                        return;
                    }

                    // Real href as last resort
                    if (href && href !== '#') {
                        window.location.href = href;
                    }
					
				});
			});
		},

        /**
         * Accordion
         * 
         * jQuery extension for creating an accordion.
         * Initializes the accordion and handles the click event on accordion titles.
         * Toggles the active state and visibility of accordion contents.
         *
         * Usage: $('.lp-accordion').lpAccordion();
         *
         * @param {Object} args - Optional arguments for reinitializing the accordion.
         * @param {boolean} args.reinit - Whether to reinitialize the accordion.
         */
        lpAccordion : function(args={}){
            return this.each(function() {

                // Set default value for reinit if not provided
                args.reinit = args.reinit || false;
                
                if (!$(this).hasClass('lp-accordion-initialized') || args.reinit) {
                    const accordion = $(this);
                    const accordionContent = accordion.find('.lp-accordion-content');

                    // Hide accordion content initially
                    accordionContent.hide();

					if( accordion.attr('data-open-in-modal') == undefined ) {
						accordion.find('.lp-accordion-title').click(function(e) {
							e.preventDefault();
							e.stopImmediatePropagation();

							const accordionTitle = $(this);
							const accordionContent = accordionTitle.next('.lp-accordion-content');

							if (accordionContent.hasClass('lp-active')) {
								// Collapse accordion
								accordionTitle.removeClass('lp-active');
								accordionContent.removeClass('lp-active');
								accordionContent.slideUp(350);
							} else {
								// Expand accordion and collapse other accordion contents
								accordion
								  .find('li > .lp-accordion-content')
								  .removeClass('lp-active')
								  .slideUp(350);
								accordionTitle.toggleClass('lp-active');
								accordionContent.toggleClass('lp-active');
								accordionContent.slideToggle(350);
							}
						});
					}

                    accordion.addClass('lp-accordion-initialized');
                }
                
            });
        },

        /**
         * Tab
         * 
         * jQuery extension for creating tabs.
         * Initializes the tabs and handles the click event on tab titles.
         * Toggles the active state and visibility of tab panels.
         *
         * Usage: $('.lp-tabs-container').lpTab();
         *
         * @param {Object} args - Optional arguments for reinitializing the tabs.
         * @param {boolean} args.reinit - Whether to reinitialize the tabs.
         */
        lpTab : function(args={}) {
            return this.each(function() {

                // Set default value for reinit if not provided
                args.reinit = args.reinit || false;

                const tabContainer = $(this);
                const tabNavs = tabContainer.find('.lp-tabs');

                if (!tabNavs.hasClass('lp-tab-initialized') || args.reinit) {
                    const tabTitles = tabNavs.find('.lp-tabs-title');
                    const tabPanels = tabContainer.find('.lp-tabs-panel');

                    // Show the first tab and hide the rest
                    tabTitles.first().addClass('lp-active');
                    tabPanels.hide();
                    tabPanels.first().show();

                    // Click function
                    tabTitles.click(function() {
                        const activeNav = $(this);
                        const targetPanel = activeNav.find('a').attr('href');

                        tabTitles.removeClass('lp-active');
                        activeNav.addClass('lp-active');
                        tabPanels.hide();

                        $(targetPanel).fadeIn();
                        return false;
                    });

                    tabNavs.addClass('lp-tab-initialized');
                }
            });
        },

        /**
         * Modal
         * 
         * jQuery extension for initializing a modal component.
         *
         * Usage: $('[data-lp-modal]').lpModal();
         */
        lpModal: function () {
            /**
             * initialize()
             * 
             * Initializes the modal component.
             *
             * @param {Object} modal - The modal element.
             */
            function initialize(modal) {
                if (modal.length) {
                    const isInlineModal = modal.attr('data-lp-inline-modal') != undefined;
                    const isResponsiveModal = modal.attr('data-lp-responsive-modal') != undefined;
                    const isActiveOnInit = modal.attr('data-active-on-init') != undefined;

                    if (is_modal(modal)) {
                        if (isInlineModal) {
                            // Delayed initialization for inline modals
                            setTimeout(function () {
                                modal.css("min-height", modal.outerHeight() + "px");
                                modal.css("width", modal.outerWidth() + "px");
                            }, 1500);
                        }

                        if (isResponsiveModal) {
                            if (is_modal(modal) && !modal.hasClass('lp-modal')) {
                                modal.addClass('lp-modal');
                            } else {
                                modal.removeClass('lp-modal');
                            }
                        }

                        if( isActiveOnInit ){
                            open_modal(modal);
                        } else {
                            close_modal(modal);
                        }
                        modal.addClass('lp-modal-initialized');
                    } else if (isResponsiveModal) {
                        if (is_modal(modal) && !modal.hasClass('lp-modal')) {
                            modal.addClass('lp-modal');
                        } else {
                            modal.removeClass('lp-modal');
                            modal.css('display', 'block');
                        }
                    }
                }
            }

            /**
             * is_modal()
             * 
             * Checks if the modal is eligible to be shown based on its responsiveness configuration.
             *
             * @param {Object} modal - The modal element.
             * @returns {boolean} - Indicates whether the modal is eligible to be shown.
             */
            function is_modal(modal) {
                let flag = false;
                if (modal.length) {
                    const isResponsiveModal = modal.attr('data-lp-responsive-modal') != undefined;
                    const modal_on_small = modal.hasClass('lp-modal-small');
                    const modal_on_medium = modal.hasClass('lp-modal-medium');
                    const modal_on_large = modal.hasClass('lp-modal-large');
                    const is_mobile = $(window).width() < 576;
                    const is_tablet = $(window).width() < 992 && $(window).width() >= 576;
                    const is_desktop = $(window).width() >= 992;

                    flag = !isResponsiveModal ||
                        (isResponsiveModal &&
                            ((modal_on_large && is_desktop) ||
                                (modal_on_medium && is_tablet) ||
                                (modal_on_small && is_mobile))
                        );
                }

                return flag;
            }

            /**
             * open_modal()
             * 
             * Opens the modal.
             *
             * @param {Object} modal - The modal element to open.
             */
            function open_modal(modal) {
                if (modal.length) {
                    const isInlineModal = modal.attr('data-lp-inline-modal') != undefined;

                    add_close(modal);
                    modal.attr('aria-active', true);

                    if (isInlineModal) {
                        if (!modal.hasClass('lp-modal')) {
                            modal.addClass('lp-modal');
                        }
                    } else {
                        modal.css('display', 'block');
                    }
                }
            }

            /**
             * close_modal()
             * 
             * Closes the modal.
             *
             * @param {Object} modal - The modal element to close.
             */
            function close_modal(modal) {
                if (modal.length) {
                    const isInlineModal = modal.attr('data-lp-inline-modal') != undefined;

                    modal.attr('aria-active', false);

                    if (isInlineModal) {
                        if (modal.hasClass('lp-modal')) {
                            modal.removeClass('lp-modal');
                            remove_close(modal);
                        }
                    } else {
                        modal.css('display', 'none');
                    }
                }
            }

            /**
             * add_close()
             * 
             * Adds the close button to the modal if it doesn't already exist.
             *
             * @param {Object} modal - The modal element.
             */
            function add_close(modal) {
                if (modal.length) {
                    const close_btn = modal.find('[data-lp-modal-close]');

                    if (!close_btn.length) {
                        modal.find('.lp-modal-content').append(
                            '<button class="lp-modal-close-button" data-lp-modal-close type="button">\
                            <span>&times;</span>\
                        </button>'
                        );
                    }
                }
            }

            /**
             * remove_close()
             * 
             * Removes the close button from the modal if it exists.
             *
             * @param {Object} modal - The modal element.
             */
            function remove_close(modal) {
                if (modal.length) {
                    const close_btn = modal.find('[data-lp-modal-close]');

                    if (close_btn.length) {
                        close_btn.remove();
                    }
                }
            }

            return this.each(function () {
                const this_modal = $(this);

                $(window).on("load", function(){
                    initialize(this_modal);
                });

                // Reinitialize on window resize (ignore mobile keyboard)
                let lastWidth = window.innerWidth;

                $(window).on('resize.lpModal', function () {

                    // Ignore resize caused by keyboard
                    if (lpKeyboardOpen) return;

                    const currentWidth = window.innerWidth;

                    // Only react to width changes (orientation / real resize)
                    if (currentWidth !== lastWidth) {
                        lastWidth = currentWidth;
                        initialize(this_modal);
                    }
                });

                // Event handler for opening the modal
                $('[data-lp-modal-open]').on('click', function (e) {
                    e.preventDefault();

                    const trigger = $(this);
                    const modal_id = trigger.attr('data-lp-modal-open');

                    open_modal($("#" + modal_id));
                });

                // Event handler for closing the modal
                this_modal.on('click', '[data-lp-modal-close]', function (e) {
                    e.preventDefault();
                    close_modal($(this).closest('.lp-modal'));
                });
            });
        },

        /**
         * Read More Link
         * 
         * jQuery extension for handling read more/less functionality.
         * Updates the content visibility and toggle link text on click.
         * Adjusts the max-height of the content container based on the expanded state.
         *
         * Usage: $('.lp-read-more-link').lpReadMore();
         */
        lpReadMoreLink: function () {
            /**
             * Toggle the read more/less functionality for each matching element.
             */
            return this.on('click', function (e) {
                e.preventDefault();
                const link = $(this);
                const element = link.closest('.lp-single-description, .lp-more-description');
                const preview = element.find('.lp-description-preview');

                // Get the initial expanded state and link text
                const expanded = preview.attr("data-expanded") === "true";
                const linkText = expanded ? "Read more" : "Read less";

                // Handle Single Description Read More
                if (element.hasClass('lp-single-description')) {
                    // Calculate the content height if not lp-more-description
                    const defaultMaxHeight = preview.maxHeight ? preview.maxHeight : "160px";
                    const allContent = preview.children();
                    let contentHeight = 0;

                    allContent.each(function () {
                      contentHeight += $(this).outerHeight(true);
                    });

                    const targetHeight = expanded ? defaultMaxHeight : contentHeight + 30;

                    preview.css('max-height', targetHeight);

                    // Animate preview height change
                    if (expanded) {
                      $('body,html').animate({
                        scrollTop: element.offset().top - 200
                      }, 500);
                    }

                // Handle More Description Read More
                } else if (element.hasClass('lp-more-description')) {
                    const description = element.find('.lp-description');

                    // Toggle the element descriptions
                    preview.toggle();
                    description.toggle();
                }

                // Update link text and expanded state
                link.html(linkText);
                preview.attr("data-expanded", !expanded);
            });
        },

        /**
         * Carousel()
         * 
         * jQuery extension for initializing carousels with responsive settings.
         *
         * Usage: $('.lp-carousel .lp-element-body').lpCarousel();
         */
        lpCarousel: function ( type = 'element' ) {
            /**
             * Generates the carousel with the provided settings.
             *
             * @param {jQuery} elem - The carousel element.
             */
            function generateCarousel(elem) {
                const sts = elem.attr('data-column');
                const element = elem.closest( type == 'media' ? '.lp-media-gallery' : '.lp-carousel' );
                const elemThumbs = element.find('.lp-gallery-thumbnail-carousel');

                /**
                 * Determine arrow visibility based on element classes
                 *  
                 * Default settings: 
                 * arrows: true (unless lp-hide-carousel-arrows is set)
                 * smarrows: false (unless lp-show-carousel-arrows-sm is set) lp-hide-carousel-arrows has no effect as it is already hidden on sm
                 * mdarrows: false (unless lp-show-carousel-arrows-md is set) lp-hide-carousel-arrows has no effect as it is already hidden on md
                 * lgarrows: true (unless lp-hide-carousel-arrows-lg is set) lp-hide-carousel-arrows has effect as it is shown on lg
                 */
                const arrows = !element.hasClass('lp-hide-carousel-arrows'); 
                const smarrows = element.hasClass('lp-show-carousel-arrows-sm') ? true : false;
                const mdarrows = element.hasClass('lp-show-carousel-arrows-md') ? true : false; 
                const lgarrows = !element.hasClass('lp-hide-carousel-arrows-lg') ? arrows : false;

                /**
                 * Determine dot visibility based on element classes
                 *  
                 * Default settings: 
                 * dots: false (unless lp-show-carousel-dots is set)
                 * smdots: true (unless lp-hide-carousel-dots-sm is set) lp-show-carousel-dots has no effect as it is already shown by default on sm
                 * mddots: true (unless lp-hide-carousel-dots-md is set) lp-show-carousel-dots has no effect as it is already shown by default on md
                 * lgdots: false (unless lp-show-carousel-dots-lg is set) lp-show-carousel-dots has effect as it is hidden by default on lg
                 */
                const dots = element.hasClass('lp-show-carousel-dots');
                const smdots = !element.hasClass('lp-hide-carousel-dots-sm') ? true : false;
                const mddots = !element.hasClass('lp-hide-carousel-dots-md') ? true : false;
                const lgdots = element.hasClass('lp-show-carousel-dots-lg') ? true : dots;

                const lgunslick = element.hasClass('disable-carousel-lg') ? true : false;
                const mdunslick = element.hasClass('disable-carousel-md') ? true : false;
                const smunslick = element.hasClass('disable-carousel-sm') ? true : false;

                // Determine adaptive height based on element class
                const adaptiveHeight = element.hasClass('lp-posts-adaptive-height');
				
				// Determine infiniteCarousel based on element class
                const infiniteCarousel = element.hasClass('lp-infinite-carousel') ? true : false;
				const autoplayAttr = element.attr('data-autoplay');

                // Determine slide to show responsively
                const defaultSlides = typeof sts !== 'undefined' && sts ? parseInt(sts, 10) : 1;
                const smSlides = 1;
                const mdSlides = Math.ceil(defaultSlides / 2);
                const lgSlides = defaultSlides;
				
				if(typeof autoplayAttr !== "undefined" && autoplayAttr == 1) {
					autoplay = true;
				} else autoplay = false;

                let slickResponsive = [{
                        breakpoint: 768,
                        settings: smunslick ? "unslick" : {
                            arrows: smarrows,
                            dots: smdots,
                            infinite: infiniteCarousel,
                            draggable: true,
                            autoplay: autoplay,
                            autoplaySpeed: 6000,
                            slidesToShow: smSlides,
                            slidesToScroll: 1,
                            adaptiveHeight: adaptiveHeight
                        }
                    },
                    {
                        breakpoint: 992,
                        settings: mdunslick ? "unslick" : {
                            arrows: mdarrows,
                            dots: mddots,
                            infinite: infiniteCarousel,
                            draggable: true,
                            autoplay: autoplay,
                            autoplaySpeed: 6000,
                            slidesToShow: mdSlides,
                            slidesToScroll: 1,
                            adaptiveHeight: adaptiveHeight
                        }
                    }];

                if( lgunslick ) slickResponsive.push({
                    breakpoint: 9999,
                    settings: lgunslick ? "unslick" : {}
                });

                // Set responsive breakpoints and settings
                elem.not('.slick-initialized').slick({
                    arrows: lgarrows,
                    dots: lgdots,
                    infinite: infiniteCarousel,
                    draggable: false,
                    autoplay: autoplay,
                    autoplaySpeed: 6000,
                    slidesToShow: lgSlides,
                    slidesToScroll: 1,
                    adaptiveHeight: adaptiveHeight,
                    asNavFor: elemThumbs.length ? '.lp-gallery-thumbnail-carousel' : false,
                    responsive: slickResponsive
                });

                if( elemThumbs.length ){

                    // Determine arrow visibility based on element classes
                    const thumbarrows = !element.hasClass('lp-hide-thumb-arrows');

                     // Determine slide to show responsively
                    let thumbSlides = element.data('thumbToShow');

                    thumbSlides = thumbSlides != undefined ? thumbSlides : 5;

                    elemThumbs.not('.slick-initialized').slick({
                        arrows: thumbarrows,
                        slidesToShow: thumbSlides,
                        slidesToScroll: 1,
                        asNavFor: '.lp-gallery-carousel',
                        focusOnSelect: true,
                    });
                }
            }

            return this.each(function () {
                const elem = $(this);
                generateCarousel(elem);

                // Handle carousel positioning within tabs
                const tabsContainer = elem.closest('.tabs-container');
                if (tabsContainer.length) {
                    const tabs = tabsContainer.find('.tabs');
                    tabs.on('change.zf.tabs', function () {
                        elem.slick('setPosition');
                    });
                }
            });
        },
		
		/**
         * Post Selector Field
         * 
         * jQuery extension to add a post selector field functionality to redirect to a post's single page when an option is selected.
         * 
         * Usage: $(selector).lpPostSelector();
         * 
         * Dependencies: jQuery
         */
        lpPostSelector: function(){
            return this.each(function() {
				$(this).on('change', function() {
					const url = $(this).find(":selected").val();              
					window.location.href = url;
				});
            });
        },

        /**
         * Google Address Lookup Field
         * 
         * Adds address lookup functionality using Google Maps Autocomplete to the specified elements.
         * 
         * Usage: $(selector).lpAddressLookup();
         * 
         * Options:
         *   - data-lookup-types: Comma-separated list of types to restrict the autocomplete results (optional).
         * 
         * Dependencies: jQuery, Google Maps JavaScript API
         */
        lpAddressLookup: function(){
            return this.each(function() {
                const fieldSet = $(this),
                    lookUpField = fieldSet.find(".lp-places-lookup,.lp-address-lookup"),
                    options = { componentRestrictions: { country: 'au' } },
					LUFInput = lookUpField[0],
					LUFAssocInput = fieldSet.find('input[type="hidden"]');
				
				// Define NZ states mapping
				const nz_states = {
					AUK: 'Auckland',
					BOP: 'Bay of Plenty',
					CAN: 'Canterbury',
					GIS: 'Gisborne',
					HKB: 'Hawke\'s Bay',
					MWT: 'Manawatū-Whanganui',
					MBH: 'Marlborough',
					NSN: 'Nelson',
					NTL: 'Northland',
					OTA: 'Otago',
					STL: 'Southland',
					TKI: 'Taranaki',
					TAS: 'Tasman',
					WKO: 'Waikato',
					WGN: 'Wellington',
					WTC: 'West Coast'
				};
					
				if( lookUpField.attr("data-lookup-types") && lookUpField.attr("data-lookup-types") != undefined ) options.types = lookUpField.attr("data-lookup-types").split(",");
				if( lookUpField.attr("data-country") && lookUpField.attr("data-country") != undefined ) options.componentRestrictions.country = lookUpField.attr("data-country");
				
				LUFInput.addEventListener('change', function(){
					if(LUFInput.value == ""){
						LUFAssocInput.each(function(){
							$(this).val("");
						});
					}
				});
						
                const autocomplete = new google.maps.places.Autocomplete(LUFInput, options);

                google.maps.event.addListener(autocomplete, "place_changed", function() {
                    const place = autocomplete.getPlace(),
                        street_address = [],
                        addressComponents = {
							administrative_area_level_1: ".lp-address-state",
                            postal_code: ".lp-address-postcode",
							country: ".lp-address-country"
						};
					
					if( options.componentRestrictions.country === 'nz' ){
						addressComponents.sublocality = ".lp-address-suburb";
					} else {
						addressComponents.locality = ".lp-address-suburb";
					}

                    place.address_components.forEach(item => {
                        if (item.types.includes("street_number") || item.types.includes("route")) {
                            street_address.push(item.short_name);
                        }

                        Object.entries(addressComponents).forEach(([type, selector]) => {
                            if (item.types.includes(type)) {
								let value = item.short_name;
								// If country is NZ and the type is 'administrative_area_level_1', map to the short name
								if (
									type === 'administrative_area_level_1' &&
									options.componentRestrictions.country === 'nz'
								) { 
									
                                    // Get google returned long name
                                    const nz_long_value = item.long_name;

                                    // Regex for checking if value is the short name
                                    const is_nz_short_value = new RegExp(`^(${Object.keys(nz_states).join('|')})$`);

                                    if (is_nz_short_value.test(nz_long_value)) {
                                        value = nz_states[value]; // Use the mapped long name
                                    } else {
                                        value = nz_long_value; // Use google returned long name
                                    }
                                    
								}
								
                                fieldSet.find(selector).val(value).trigger('change');
                            }
                        });
                    });

                    const streetField = fieldSet.find(".lp-address-street");
                    if (streetField.length && street_address.length) {
                        streetField.val(street_address.join(", ")).trigger('change');
                    }

                    fieldSet.find(".lp-address-lat").val(place.geometry.location.lat()).trigger('change');
                    fieldSet.find(".lp-address-lng").val(place.geometry.location.lng()).trigger('change');

                });

            });
        },
		
		/**
         * Gravity Form Google Address Lookup Field
         * 
         * Turns Gravity Form field to an address lookup field using Google Maps Autocomplete to the specified elements.
         * 
         * Usage: $(selector).lpGFAddressLookup();
         * 
         * Dependencies: jQuery, Google Maps JavaScript API
         */
		lpGFAddressLookup: function(){
            return this.each(function() {
                const lookUpField = $(this),
					form = $(this).closest('form'),
					options = { componentRestrictions: { country: 'au' } },
					LUFInput = lookUpField.find('input')[0],
					LUFAddressParts = lookUpField.find('[class*="lp-gf-address-"]:not(.lp-gf-address-lookup)');
				
				// Define NZ states mapping
				const nz_states = {
					AUK: 'Auckland',
					BOP: 'Bay of Plenty',
					CAN: 'Canterbury',
					GIS: 'Gisborne',
					HKB: 'Hawke\'s Bay',
					MWT: 'ManawatÅ«-Whanganui',
					MBH: 'Marlborough',
					NSN: 'Nelson',
					NTL: 'Northland',
					OTA: 'Otago',
					STL: 'Southland',
					TKI: 'Taranaki',
					TAS: 'Tasman',
					WKO: 'Waikato',
					WGN: 'Wellington',
					WTC: 'West Coast'
				};
				
				LUFInput.addEventListener('change', function(){
					if(LUFInput.value == ""){
						LUFAddressParts.find('input').each(function(){
							$(this).val("");
						});
					}
				});
						
				const autocomplete = new google.maps.places.Autocomplete(LUFInput, options);

				google.maps.event.addListener(autocomplete, "place_changed", function() {
					const place = autocomplete.getPlace(),
						street_address = [],
						addressComponents = {
							administrative_area_level_1: ".lp-gf-address-state",
							postal_code: ".lp-gf-address-postcode",
							country: ".lp-gf-address-country"
						};
					
					if( options.componentRestrictions.country === 'nz' ){
						addressComponents.sublocality = ".lp-gf-address-suburb";
					} else {
						addressComponents.locality = ".lp-gf-address-suburb";
					}

					place.address_components.forEach(item => {
						if (item.types.includes("street_number") || item.types.includes("route")) {
							street_address.push(item.short_name);
						}

						Object.entries(addressComponents).forEach(([type, selector]) => {
							if (item.types.includes(type)) {
								let value = item.short_name;
								// If country is NZ and the type is 'administrative_area_level_1', map to the short name
								if (
									type === 'administrative_area_level_1' &&
									options.componentRestrictions.country === 'nz'
								) { 

									// Get google returned long name
                                    const nz_long_value = item.long_name;

                                    // Regex for checking if value is the short name
                                    const is_nz_short_value = new RegExp(`^(${Object.keys(nz_states).join('|')})$`);

                                    if (is_nz_short_value.test(nz_long_value)) {
                                        value = nz_states[value]; // Use the mapped long name
                                    } else {
                                        value = nz_long_value; // Use google returned long name
                                    }
                                    
								}
								
								form.find(selector).find('input').val(value);
							}
						});
					});

					const streetField = form.find(".lp-gf-address-street");
					if (streetField.length && street_address.length) {
						streetField.find('input').val(street_address.join(" "));
					}

					form.find(".lp-gf-address-lat").find('input').val(place.geometry.location.lat());
					form.find(".lp-gf-address-lng").find('input').val(place.geometry.location.lng());

				});

            });
        },
		
		/**
         * Gravity Form Rich Post Select2 Field
         * 
         * Form Filter Tag functionality.
         * 
         * Usage: 
		 * $(document).on('gform_post_render', function(event, formId) {
		 *	 $(selector).lpGFSelect2();
		 * });
         * 
         * Dependencies: jQuery, select2
         */
        lpGFSelect2: function(){
            return this.each(function() {
				let thisSelect = $(this), 
					placeholderText = thisSelect.find('option.gf_placeholder').text() || "Select an option",
					
					lpRichOptionFormat = function( option ){
						if (!option.id) return option.text; // Skip placeholder option
		  
						let optionElement = $(option.element),
							image = $(option.element).data('image'),
							dataAttributes = [];

							$.each(optionElement[0].attributes, function(index, attr) {
								let match = attr.name.match(/^data-content-(.+)$/);
								if (match && attr.value.trim()) {
								    let key = match[1],
									    value = attr.value;
								    dataAttributes.push(`<span class="lp-data-${key}" data-key="${key}">${value}</span>`);
								}
							});
							
						let optionHtml = '';
						
						if( image || dataAttributes.length ){
							optionHtml = `
								<div class="lp-rich-option">
									<div class="lp-media">
										<div class="lp-overlay"></div>
										<div class="lp-image" style="background-image: url(${image});"></div>
									</div>
									<div class="lp-content">
										<div class="lp-title">${option.text}</div>
										<div class="lp-data">${dataAttributes.join(' ')}</div>
									</div>
								</div>
							`;
						} else {
							optionHtml = option.text;
						}

						return optionHtml;
					};

				thisSelect.select2({
					placeholder: placeholderText,
					allowClear: true,
					width: '100%',
					selectionCssClass: 'lp-select2-select lp-select2-select-gf-select-2',
					dropdownCssClass: 'lp-select2-dropdown lp-select2-dropdown-gf-select-2',
					templateResult: lpRichOptionFormat, // Format dropdown options
					escapeMarkup: function(markup) { return markup; } // Allow HTML rendering
				 });

            });
        },

        /**
         * Checkbox Field
         * 
         * Adds checkbox field functionality.
         * 
         * Usage: $(selector).lpCheckbox();
         * 
         * Dependencies: jQuery
         */
        lpCheckbox: function(){
            return this.each(function() {
                const lp_checkbox = $(this);
                const isTree = lp_checkbox.hasClass('lp-checkbox-tree');
                const isDrillDown = lp_checkbox.hasClass('lp-checkbox-drill-down');
                    
                /* ------------------------------------
                * DRILL-DOWN FUNCTIONALITY
                * ---------------------------------- */
                if (isDrillDown) {
                    lp_checkbox.on('click', '.lp-drill-down', function(event) {
                        event.preventDefault();
                        let drill_down = $(this),
                            option = drill_down.closest('.lp-checkbox-option'),
                            slug = option.data('slug'),
                            input = option.children('input'),
                            cb_wrap = option.closest('.lp-checkbox'),
                            all_options = cb_wrap.children('.lp-checkbox-option'),
                            breadcrumb = cb_wrap.children('.lp-checkbox-breadcrumb'),
                            sub_options = cb_wrap.find('.lp-checkbox-sub-options[data-parent="' + slug + '"]');

                        // Auto check the current then input checkbox
                        input.prop('checked', true).trigger('change');

                        // Hide all parent cb options and back links
                        all_options.hide();
                        breadcrumb.hide();

                        // Show the child category section for the selected category
                        if (sub_options.length) {
                            sub_options.show();
                        }
                    });

                    // Back button functionality
                    lp_checkbox.on('click', '.lp-back-link', function(event) {
                        event.preventDefault();
                        let back_link = $(this),
                            current_sub_options = back_link.closest('.lp-checkbox-sub-options'),
                            parent_cb_wrap = current_sub_options.closest('.lp-checkbox'),
                            breadcrumb = parent_cb_wrap.children('.lp-checkbox-breadcrumb'),
                            all_options = parent_cb_wrap.children('.lp-checkbox-option');

                        // Hide current child categories and show the parent category
                        current_sub_options.hide();
                        all_options.show();
                        breadcrumb.show();
                    });

                    // Checkbox change behavior
                    lp_checkbox.on('change', 'input[type="checkbox"]', function() {
                        let checkbox = $(this),
                            is_checked = checkbox.prop('checked'),
                            option = checkbox.closest('.lp-checkbox-option'),
                            slug = option.data('slug'),
                            root_wrap = checkbox.closest('.lp-checkbox[data-level="0"],.lp-checkbox:not([data-level])'),
                            cb_input_value = root_wrap.children('.lp-checkbox-value');

                        if (!is_checked) {
                            // Find and uncheck all child checkboxes within the sub-options of the unchecked parent
                            root_wrap
                                .find('.lp-checkbox-sub-options[data-parent="' + slug + '"] input[type="checkbox"]')
                                .prop('checked', false);
                        }

                        // Update hidden field
                        let selectedValues = [];
                    
                        // Loop through each checked checkbox and get its value
                        root_wrap
                            .find('.lp-checkbox-option input[type="checkbox"]:checked')
                            .each(function() {
                                selectedValues.push($(this).val());
                            });
                        
                        // Update the hidden field with the selected values as a comma-separated list
                        cb_input_value.val(selectedValues.join(','));
                    });

                }

                /* ------------------------------------
                 * TREE VIEW FUNCTIONALITY
                 * ---------------------------------- */
                if (isTree) {
                    // Click on the dropdown arrow: auto-check parent & show children
                    lp_checkbox.on('click', '.lp-drop-down', function(event) {
                        event.preventDefault();

                        let toggle = $(this),
                            option = toggle.closest('.lp-checkbox-option'),
                            checkbox = option.children('input[type="checkbox"]'),
                            slug = option.data('slug'),
                            cb_wrap = option.closest('.lp-checkbox'),
                            sub_options = cb_wrap.children('.lp-checkbox-sub-options[data-parent="' + slug + '"]');

                        if (option.hasClass('is-open')) {
                            // Parent is open → close sub-options without changing checkbox
                            sub_options.slideUp(150);
                            option.removeClass('is-open');
                        } else {
                            // Parent is closed → open sub-options (and optionally check parent)
                            if (!checkbox.prop('checked')) {
                                checkbox.prop('checked', true).trigger('change'); // optional, only if you want auto-check
                            } else {
                                sub_options.slideDown(150);
                                option.addClass('is-open');
                            }
                        }
                    });

                    // Checkbox change behavior
                    lp_checkbox.on('change', 'input[type="checkbox"]', function() {
                        let checkbox = $(this),
                            is_checked = checkbox.prop('checked'),
                            option = checkbox.closest('.lp-checkbox-option'),
                            slug = option.data('slug'),
                            cb_wrap = option.closest('.lp-checkbox');

                        let sub_options = cb_wrap.children('.lp-checkbox-sub-options[data-parent="' + slug + '"]');

                        if (is_checked) {
                            // Open sub-options when parent is checked
                            if (sub_options.length) {
                                sub_options.slideDown(150);
                                option.addClass('is-open');
                            }
                        } else {
                            // Uncheck all children and close tree when parent is unchecked
                            sub_options.find('input[type="checkbox"]').prop('checked', false);
                            sub_options.slideUp(150);
                            option.removeClass('is-open');
                        }

                        // Update hidden field
                        let root_wrap = checkbox.closest('.lp-checkbox[data-level="0"],.lp-checkbox:not([data-level])'),
                            cb_input_value = root_wrap.children('.lp-checkbox-value'),
                            selectedValues = [];

                        root_wrap
                            .find('.lp-checkbox-option input[type="checkbox"]:checked')
                            .each(function() {
                                selectedValues.push($(this).val());
                            });

                        cb_input_value.val(selectedValues.join(','));
                    });

                    // INITIAL STATE: show sub-options for checked parents
                    lp_checkbox.find('input[type="checkbox"]:checked').each(function () {
                        let checked = $(this),
                            option = checked.closest('.lp-checkbox-option'),
                            slug = option.data('slug'),
                            cb_wrap = option.closest('.lp-checkbox'),
                            sub_options = cb_wrap.children('.lp-checkbox-sub-options[data-parent="' + slug + '"]');

                        if (sub_options.length) {
                            sub_options.show();
                            option.addClass('is-open');
                        }

                        // Ensure ancestors are open
                        option.parents('.lp-checkbox-sub-options').show();
                        option.parents('.lp-checkbox-option').addClass('is-open');
                    });
                }

            });
        },

        /**
         * Form Filter Tag
         * 
         * Form Filter Tag functionality.
         * 
         * Usage: $(selector).lpFormFilterTag();
         * 
         * Dependencies: jQuery
         */
        lpFormFilterTag: function(){
            return this.each(function() {
                const filterTag = $(this);
                    
                filterTag.on('click', '.lp-tag-action.lp-remove', function(){
                    let action = $(this),
                        name = action.data('name'),
                        setType = action.data('setType'),
                        id = action.data('id'), // the specific value to delete for multi-select
                        urlParams = new URLSearchParams(window.location.search),

                    removeValue = function removeValue(paramName, valueToRemove) {
                        let currentValues = urlParams.get(paramName);
                        
                        if (currentValues) {
                            let valuesArray = currentValues.split(',');
                            valuesArray = valuesArray.filter(value => value !== valueToRemove);
                            if (valuesArray.length) {
                                urlParams.set(paramName, valuesArray.join(','));
                            } else {
                                urlParams.delete(paramName);
                            }
                        }
                    }; // Get current URL parameters

                    // If range is true, remove both min_{name} and max_{name} parameters
                    switch (setType) {
                        case 'range' :
                            // Remove both min_{name} and max_{name} parameters for range type
                            urlParams.delete(`min_${name}`);
                            urlParams.delete(`max_${name}`);
                            break;

                        case 'multi-select' :
                            let parent_tag = action.closest('.lp-form-filter-tag'),
                                child_tags = parent_tag.find('.lp-form-filter-tag'),
                                child_actions = child_tags.find('.lp-tag-action.lp-remove');

                            if (id) {
                                // Remove the specific value for multi-select
                                removeValue(name, id);

                                // Loop through each child action and remove its associated value
                                child_actions.each(function() {
                                    let childAction = $(this),
                                        childId = childAction.data('id'),
                                        childName = childAction.data('name');

                                    // Remove the child tag's specific value
                                    if (childId) {
                                        removeValue(childName, childId);
                                    } 
                                });
                            } else {
                                // Remove the entire parameter if no `id` is specified
                                urlParams.delete(name);
                            }
                            break;

                        default: 
                            // Otherwise, just remove the parameter with the name
                            urlParams.delete(name);
                    }

                    // Update the URL and reload the page
                    if( urlParams.size ){
                        window.location.href = `${window.location.pathname}?${urlParams}`;
                    } else {
                        window.location.href = `${window.location.pathname}`;
                    }
                });

            });
        },

        /**
         * Map
         * 
         * Generate Google Maps based on the different data attributes supplied on the map html structure.
         * 
         * Usage: $(selector).lpMap();
         * 
         * Dependencies: jQuery, Google Maps JavaScript API
         */
        lpMap: function(){

            /**
             * googleMap()
             * 
             * Google Map function that handles the generation of the advanced google map, this contains multiple helper functions
             * and hooks and customize the map element.
             *
             * @param {Object} map - The map element.
             */
            function googleMap(map){
                this.map = map;
                this.mapEl = jQuery(this.map);
                this.mapContainer = this.mapEl.closest('.lp-element-map');
                this.repElement = this.mapEl.closest('.lp-element');
                this.mapElementBody = this.mapEl.closest('.lp-element-body');
                this.mapElementResult = this.mapElementBody.find('.lp-element-result');
                this.elementID = this.repElement.attr('id');
                this.mapElementNavs = this.repElement.find('.lp-element-navs .lp-nav');
                this.mapElementSummary = this.repElement.find('.lp-total-element-summary');
                this.mapElementList = this.mapElementResult.find('.lp-element-list');
                this.elements = this.mapEl.attr('data-elements');
                this.getElementURL = this.mapEl.attr('data-get-element-url');
                this.perPage = this.mapEl.attr('data-per-page');
                this.maxWords = this.mapEl.attr('data-max-words');
                this.maxPosts = this.mapEl.attr('data-max-posts');
                this.rPage = this.mapEl.attr('data-rpage');
                this.layout = this.mapEl.attr('data-map-layout');
                this.type = this.mapEl.attr('data-type');
                
                this.lat = this.mapEl.attr('data-lat');
                this.lng = this.mapEl.attr('data-lng');
                this.mapStyle = ( this.mapEl.attr('data-style') != undefined ? this.mapEl.attr('data-style').length : 0 ) 
                    ? JSON.parse( this.mapEl.attr('data-style') ) : {};
                this.mapZoom = this.mapEl.attr('data-zoom');
                this.mapMarkerIcon = ( this.mapEl.attr('data-marker') != undefined ? this.mapEl.attr('data-marker').length : 0 ) 
                    ? JSON.parse( this.mapEl.attr('data-marker') ) : {};
                
                this.total = 0;
                this.skip = 0;
                this.take = 0;
                
                this.prevClickedPinID = 0;
                this.infoWindowOpen = false;
                this.activeInfoWindow = false;
                this.locations = [];
                this.markers = [];
                this.gmap = {};
                this.bounds = new google.maps.LatLngBounds();
                this.mapFocusZoom = Number( this.mapEl.attr('data-focus-zoom') );
                
                this.getMarkerIcon = function( mapMarker ){
                    let args = {}; 

                    if( mapMarker.url != undefined ) 
                        args.url = mapMarker.url;
                    if( mapMarker.width != undefined && mapMarker.height != undefined )
                        args.scaledSize = new google.maps.Size(this.mapMarkerIcon.width, this.mapMarkerIcon.height);

                    return args;
                };
                
                this.mapOption = lpLoader.applyFilter("lp__map_option", {
                    center: new google.maps.LatLng( -24.766785, 134.824219 ),
                    zoom: Number( this.mapZoom ),
                    icon: this.getMarkerIcon( this.mapMarkerIcon ),
                    styles: this.mapStyle,
                    default_icon : this.getMarkerIcon( this.mapMarkerIcon ),
                    selected_icon : this.getMarkerIcon( this.mapMarkerIcon ),
                    visited_icon : this.getMarkerIcon( this.mapMarkerIcon ),
                }, this.type, this.layout);
                
                /**
                 * init()
                 * 
                 * Initialize map element.
                 */
                this.init = function () {
                    var _this = this;
                    
                    if(this.lat && this.lng){
                        var lat = Number(this.lat);
                        var lng = Number(this.lng);
                        var mapArgs = {
                            zoom: this.mapFocusZoom,
                            center: new google.maps.LatLng( lat, lng ),
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                        };

                        if( this.mapOption.styles.length ) mapArgs.styles = this.mapOption.styles;
                    
                        this.gmap = new google.maps.Map(this.map, mapArgs);
                        
                        this.loadSimpleMarker(lat, lng);
                        
                    } else {
                        // Set Google map
                        this.gmap = new google.maps.Map(this.map, {
                            styles: this.mapOption.styles,
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                        });
                        
                        // Get and Load elements list
                        if(_this.elements != undefined && _this.elements){
                            
                            var parseElements = lpLoader.applyFilter( 'lp__map_elements', JSON.parse( _this.elements ), _this );
                            if( parseElements.Results.length ){
                                _this.total = _this.take = parseElements.Results.length;
                                // Load Elements
                                _this.loadElements( parseElements.Results );
                                // Load Map Menu
                                _this.loadMapNavs();
                                _this.loadInMapNavs();
                            }

                        } else if(_this.getElementURL != undefined && _this.getElementURL){ 
                            _this.mapContainer.append(_this.preloadHTML());
                            
                            var requestURL = lpLoader.applyFilter(
                                'lp__map_request_url', 
                                _this.getElementURL + "?rsid="+_this.elementID+"&per_page="+_this.perPage+"&rpage="+_this.rPage+"&max_words="+_this.maxWords,
                                _this
                            ); 
                            
                            $.ajax({
                                url: requestURL,
                                dataType: 'json',
                                success: function (elements, textStatus, xhr) {
                                    jQuery('.lp-preloader').remove();
                                    
                                    if(elements.Results ? elements.Results.length : false){
                                        _this.total = _this.maxPosts && elements.Total > _this.maxPosts ? _this.maxPosts : elements.Total;
                                        _this.skip = elements.Skip;
                                        _this.take = elements.Results.length;
                                        // Load Elements
                                        _this.loadElements(elements.Results);
                                        // Load Map Menu
                                        _this.loadMapNavs();
                                        _this.loadInMapNavs();
                                    }
                                }
                            });
                        } 
                    }
                    
                };
                
                /**
                 * loadSimpleMarker()
                 * 
                 * Load a simple map marker without any functionality.
                 *
                 * @param {number} lat - map latitute coordinate.
                 * @param {number} lng - map longitute coordinate.
                 */
                this.loadSimpleMarker = function(lat, lng){
                    var _this = this; 
                    var marker = {};
                    
                    if(lat && lng){
                        let markerArgs = {
                            position: new google.maps.LatLng(lat, lng),
                            animation: google.maps.Animation.DROP,
                            map: _this.gmap,
                        };

                        if( _this.mapOption.default_icon.url != undefined ) markerArgs.icon = _this.mapOption.default_icon;

                        marker = new google.maps.Marker( markerArgs );
          
                        marker.id = 'p_pin';
                        
                        this.markers.push(marker);   
                    }
                }
                
                /**
                 * appendElements()
                 * 
                 * Helper function to append and load map result cards based on the element request url data attribute.
                 * This is also load map navigation link
                 */
                this.appendElements = function (){
                    var _this = this; 
                    
                    if(_this.getElementURL != undefined && _this.getElementURL) {
                        _this.mapContainer.append(_this.preloadHTML());
                        $.ajax({
                            url: _this.getElementURL + "?per_page="+_this.perPage+"&rpage="+_this.rPage+"&max_words="+_this.maxWords,
                            dataType: 'json',
                            success: function (elements, textStatus, xhr) {
                                jQuery('.lp-preloader').remove();
                                 
                                if(elements.Results ? elements.Results.length : false){
                                    _this.total = _this.maxPosts && elements.Total > _this.maxPosts ? _this.maxPosts : elements.Total;
                                    _this.skip = elements.Skip;
                                    _this.take = elements.Results.length;
                                    // Load Elements
                                    _this.loadElements(elements.Results, true);
                                    
                                    // Load Map Menu
                                    _this.loadMapNavs();
                                    
                                    if(_this.skip + _this.take >= _this.total){
                                        _this.mapContainer.find('.lp-nav-show-more').remove();
                                    }
                                }
                            }
                        });
                    }
                    
                }
                
                /**
                 * loadElements()
                 * 
                 * Load location card item, and marker to the map element and update map to fit items
                 *
                 * @param {array} locations - array of locations with coordinates.
                 * @param {boolean} appendResult - indication to append location card and marker.
                 */
                this.loadElements = function (locations, appendResult=false) {
                    this.locations = locations;
                    var _this = this; 

                    // Clear markers to make sure it's empty beflore loading any
                    if(!appendResult){
                        _this.cleareprkers();   
                        _this.mapElementList.html('');
                    }
                    
                    // Loop through locations to add as markers
                    for (var i = 0; i < locations.length; i++) { 
                        var marker = {};
                        var location = locations[i];
                        
                        if(location.Coordinates){
                            
                            marker = new google.maps.Marker(
                                lpLoader.applyFilter('lp__map_marker', {
                                    position: new google.maps.LatLng(location.Coordinates.Latitude, location.Coordinates.Longitude),
                                    icon: _this.mapOption.default_icon,
                                    default_icon: _this.mapOption.default_icon,
                                    selected_icon: _this.mapOption.selected_icon,
                                    animation: google.maps.Animation.DROP,
                                    map: _this.gmap,
                                }, location.Coordinates, _this )
                            );
                            
                            //extend the bounds to include each marker's position
                            _this.bounds.extend(marker.position);
              
                            marker.id = Number(i) + Number(_this.skip);
                            
                            // SET INFO WINDOW CONTENT
                            marker['infowindow'] = new google.maps.InfoWindow({
                                content: _this.infoWindow(location)
                            });
                            
                            if(_this.layout == "lp-map-layout-2"){ 
                                if(_this.mapElementList.length){
                                    _this.mapElementList.append(
                                        lpLoader.doAction('lp__add_map_element_list_item', marker.id, location, _this)
                                    );
                                }
                            }
                            
                            if(_this.layout == "lp-map-layout-1" && jQuery(window).width() >= 992){ 
                                google.maps.event.addListener(marker, 'click', function () {
                                    _this.openSimplePreview(this);
                                });
                            } else { 
                                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                                    return _this.openAdvancedPreview(marker);
                                })(marker, i));
                            }
                            
                            this.markers.push(marker);   
                        }
                    }
                    
                    // Set map center and fit all markets
                    this.fitMapMarkers();
                };
                
                /**
                 * openSimplePreview()
                 * 
                 * Open a simple map marker preview window for marker details
                 *
                 * @param {object} marker - Google map marker object.
                 */
                this.openSimplePreview = function(marker){
                    if (this.activeInfoWindow) { this.activeInfoWindow.close();}
                    marker['infowindow'].open(this.gmap, marker);
                    this.activeInfoWindow = marker['infowindow'];
                };
                
                /**
                 * openAdvancedPreview()
                 * 
                 * Open an advanced map marker preview window for marker details
                 *
                 * @param {object} marker - Google map marker object.
                 */
                this.openAdvancedPreview = function(marker){
                    var _this = this;
                    if (marker['infowindow']) { marker['infowindow'].close();} 

                    var infoWindow =  function () { 
                        var the_content = marker.infowindow.content;
                        // Update the size of the map pin when clicked
                        if( marker.selected_icon.url != undefined ) marker.setIcon(marker.selected_icon);

                        // Return the previous clicked map pin to its default map pin, if the previous pin window is still open
                        if(_this.infoWindowOpen && _this.markers[_this.prevClickedPinID].default_icon.url != undefined ){
                            _this.markers[_this.prevClickedPinID].setIcon(_this.markers[_this.prevClickedPinID].default_icon);
                        }

                        // Open Info Window once pins are updated
                        _this.infoWindowOpen = true;

                        // Set the previous click pin
                        _this.prevClickedPinID = marker.id; 

                        var info_window_container = _this.mapElementBody.find('.lp-info-window');

                        if (info_window_container.length > 0 ) {
                            _this.repElement.removeClass('lp-map-preview-open');
                            info_window_container.remove();
                        } 
                        
                        _this.mapElementBody.append("<div class='lp-columns lp-info-window'>" + the_content + "</div>");
                        if(!_this.repElement.hasClass('lp-map-preview-open')){
                            _this.repElement.addClass('lp-map-preview-open');   
                        }
                        
                        if(jQuery(window).width() < 992){
                            _this.gmap.setCenter(marker.position);   
                        }
                    }
                    
                    _this.activeInfoWindow = infoWindow;

                    return infoWindow;
                };
                
                /**
                 * infoWindow()
                 * 
                 * Info window html, this is shown when user hover on a marker
                 * 
                 * @param {array} location - An array of location details.
                 */
                this.infoWindow = function (location) {
                    var infoWindow = "";

                    infoWindow = "<div class='lp-info-window'>" + 
                        lpLoader.applyFilter('lp__info_window', location, this) +
                    "</div>";

                    return infoWindow;
                }; 
                
                /**
                 * cleareprkers()
                 * 
                 * Helper function to clear map marker
                 */
                this.cleareprkers = function(){
                    for (var i=0; i < this.markers.length; i++) {
                      this.markers[i].setMap(null);
                    }
                };
                
                /**
                 * fitMapMarkers()
                 * 
                 * Helper function to fit markers on the map.
                 */
                this.fitMapMarkers = function(){
                    var _this = this;
                    _this.gmap.fitBounds(_this.bounds);
                }
                
                /**
                 * loadMapNavs()
                 * 
                 * Helper function to load map navigation, this also update map element summary and add listeners to the navs.
                 */
                this.loadMapNavs = function () {
                    // Element Item Listeners
                    this.addElementItemListener();
                    
                    // Render Navigations
                    this.mapNav();
                    this.elementSummary();
                    
                    // Add Listeners
                    this.mapNavListener();
                    
                    lpLoader.doAction('lp__load_map_navs', this);
                };
                
                /**
                 * loadInMapNavs()
                 * 
                 * Helper function to load navigation inside the map
                 */
                this.loadInMapNavs = function () {
                    if(this.skip + this.take < this.total){
                        this.inMapNavs();
                        this.inMapNavListener();   

                        lpLoader.doAction('lp__load_in_map_navs', this);
                    }
                };
                
                /**
                 * mapNav()
                 * 
                 * Update the map navigation based on the responsively based on map layout
                 */
                this.mapNav = function(){
                    if(this.mapElementNavs.length && this.layout == "lp-map-layout-2"){
                        if(jQuery(window).width() < 992){ 
                            if(!this.mapElementNavs.find(".lp-nav-map").length){ 
                                this.mapElementNavs.prepend("<a href='#' class='lp-nav-map'>Map</a>");    
                            }
                        } else { 
                            if(this.mapElementNavs.find(".lp-nav-map").length){ 
                                this.mapElementNavs.find(".lp-nav-map").remove();   
                            }
                        }
                    }
                };
                
                /**
                 * elementSummary()
                 * 
                 * Load map element summary
                 */
                this.elementSummary = function(){
                    if(this.mapElementSummary.length){
                        var summary = 'Showing <span class="lp-take">'+(this.skip + this.take)+'</span> of <span class="lp-total">'+this.total+'</span> <span class="lp-type">'+this.type+'</span>';
                        if(this.layout == "lp-map-layout-2" && jQuery(window).width() < 992){
                            this.mapElementSummary.html(
                                lpLoader.applyFilter('lp__element_summary', summary, this)
                            );
                        } else {
                            this.mapElementSummary.html('<div class="lp-total-summary">'+summary+'</div>');   
                        }
                    }
                }
                
                /**
                 * inMapNavs()
                 * 
                 * Load map element navigations inside the map
                 */
                this.inMapNavs = function(){
                    if(this.mapContainer.length){
                        var inmapnavs = this.mapContainer.find(".lp-inmap-nav");
                        if(!inmapnavs.length){ 
                            this.mapContainer.prepend("<div class='lp-inmap-nav'><nav class='lp-nav'><a href='' class='lp-nav-show-more'>Show more pins</a></nav></div>");    
                        }
                    }
                }
                
                /**
                 * addElementItemListener()
                 * 
                 * Add map card item listiner that open marker infowindow when card is click
                 */
                this.addElementItemListener = function(){
                    var _this = this;
                    if(_this.layout == "lp-map-layout-2"){
                        // Add Event Listener to Review List Item
                        _this.mapElementList.find('.lp-box').each(function(){
                            var elementItem = jQuery(this);
                            var markerId = elementItem.attr('data-marker-id');
                            
                            elementItem.on('click', function(){
                                // hide result list
                                _this.repElement.removeClass('lp-list-open');
                                
                                // Rest Info Window Before opening a new one
                                _this.resetInfoWindow();
                                
                                // Trigger open map marker event
                                google.maps.event.trigger(_this.markers[markerId], 'click');
                                
                            });
                        });
                    }
                }
                
                /**
                 * mapNavListener()
                 * 
                 * Add map navitation listiner
                 */
                this.mapNavListener = function(){
                    var _this = this;
                    this.repElement.find('.lp-nav-map').on('click', function (e) { 
                        e.preventDefault();
                        _this.repElement.removeClass('lp-list-open');
                        
                        _this.resetInfoWindow();
                    });   
                };
                
                /**
                 * inMapNavListener()
                 * 
                 * Add navitation listiner inside the map navigation links
                 */
                this.inMapNavListener = function(){
                    var _this = this;
                    var showMore = this.mapContainer.find('.lp-nav-show-more');
                    
                    showMore.on('click', function (e) { 
                        e.preventDefault();
                        
                        if(_this.skip + _this.take < _this.total){
                            _this.rPage = Number(_this.rPage) + 1;
                            _this.mapEl.attr('data-rpage', _this.rPage);
                            _this.appendElements();
                        }
                    });   
                };
                
                /**
                 * resetInfoWindow()
                 * 
                 * Reset info windows states
                 */
                this.resetInfoWindow = function(){
                    // Return the previous clicked pin to it's default map pin

                    if( this.markers[this.prevClickedPinID].default_icon.url != undefined )
                        this.markers[this.prevClickedPinID].setIcon(this.markers[this.prevClickedPinID].default_icon);
                    
                    // Reset previous clicked PIN and info window as there is no open window
                    this.prevClickedPinID = 0;
                    this.infoWindowOpen = false;
                    this.repElement.removeClass('lp-map-preview-open');
                    this.mapElementBody.find('.lp-info-window').remove();
                    
                    this.fitMapMarkers();
                }
                
                /**
                 * preloadHTML()
                 * 
                 * Construct map preload html
                 */
                this.preloadHTML = function ( message = "" ){
                    return '<div class="lp-preloader"><div class="lp-map-loader"><div class="lp-pin"></div><div class="pulse"></div></div><div class="lp-loader-message">'+ message +'</div></div>';
                }
            }

            return this.each(function(index){
                var map = this; 
                $(map).attr('data-map-index', index);
                var newGoogleMap = new googleMap(map);
                newGoogleMap.init();
                
                // Handle Map on Resize
                $(window).resize(function(){
                    if(newGoogleMap.lat == undefined && newGoogleMap.lng == undefined){
                        newGoogleMap.fitMapMarkers();
                        newGoogleMap.loadMapNavs();
                        newGoogleMap.resetInfoWindow();   
                    }
                });
                
                // Handle Map when inside tab
                let tabs_container = jQuery(map).closest(".tabs-container");

                if(tabs_container.length){
                    var tabs = tabs_container.find(".tabs");
                    tabs.each(function(){
                        var tab = jQuery(this); 
                      
                        tab.on("change.zf.tabs", function (event, tab) {
                            rep_map.fitMapMarkers();
                            rep_map.loadMapNavs();
                        });
                    });
                }
            });
        },
    });

    $(document).ready(function() {
    	
    	/****************************
        * Initializations
        ****************************/
        // Initialize Accordions
        $('.lp-accordion').lpAccordion();
		
		// Initialize Back Buttons
		$('.lp-back-button').lpBackButton();

        // Initialize Tabs
        $('.lp-tabs-container').lpTab();

        // Initialize Checkbox
        $('.lp-checkbox').lpCheckbox();

        // Initialize Form Filter Tags
        $('.lp-form-filter-tag').lpFormFilterTag();

        // Initialize Modals
        $('[data-lp-modal]').lpModal();

        // Initialize Read More Link
        $('.lp-read-more-link').lpReadMoreLink();

        // Initialize Carousel
        $('.lp-carousel .lp-element-body').lpCarousel();
		
		// Initialize Carousel
        $('.lp-media-gallery .lp-gallery-carousel').lpCarousel( 'media' );
		
		// Initialize Post Selector Field
		$('.lp-post-selector').lpPostSelector();
		
		$(document).on('gform_post_render', function(event, formId) {
			$('.lp-select2-enabled select').lpGFSelect2();
		});
    	
    });

})(jQuery);

/*****************************
 ! jQuery Extensions - END
 * **************************/

/*****************************
 # Google Map Callback - START
 * **************************/

function initMap(){
	jQuery(document).ready(function(){
		// Initialize Address Lookup Field
		jQuery('.lp-field-lookup,.lp-field-address-lookup').lpAddressLookup();
		jQuery('.lp-gf-address-lookup').lpGFAddressLookup();
	});
	
	// Initialize Google Map
	jQuery('.lp-map .lp-google-map').lpMap();

    lpLoader.doAction( 'google_map_init', google );
}

/*****************************
 ! Google Map Callback - END
 * **************************/