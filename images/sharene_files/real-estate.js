/*******************************************
 * Real Estate Script
 * *****************************************
 *
 * Author: Hicaliber
 * Author URL: hicaliber.com.au
 * 
 * Table of Contents:
 * - REP Search Form
 *   - updatePrice
 *   - update_land
 *   - switchActiveNav
 *   - switchForm
 * 	 - REP Search Form Events
 * 
 ******************************************/

jQuery(document).ready(function($) {
	
	let searchForms = $('.rep-search-form'),
		propertySearchTypes = ['sale','lease','sold','leased'],
		appraisalSearchTypes = ['sell','manage','suburb_report'],
		searchablePropertyElement = $(".rep-listings-element.lp-is-searchable"),
		searchFormModal = $('.rep-property-search-form-modal');

	/*****************************
	 # REP Search Form - START
	 * ***************************
	 * 
	 * Initialize search forms
	 */ 
	searchForms.each( function(){
		let searchForm = $(this),
			layout = searchForm.attr('data-layout'),
			propertyForm = searchForm.find('.rep-property-form'),
			appraisalForm = searchForm.find('.rep-appraisal-form'),
			employeeForm = searchForm.find('.rep-employee-form, .rep-team-member-form'),
			agencyForm = searchForm.find('.rep-agency-form, .rep-office-form'),
			suburbForm = searchForm.find('.rep-suburb-form'),

			/**
             * updatePrice()
             * 
             * Search form helper function to update prices fields 
             *
             * @param {jQuery} _propertyForm - The property search form element.
             * @param {string} state - The search form state type.
             * @param {string} category - The search form category type.
             */
			updatePrice = function( _propertyForm, state, category ){
				let sale_price = [50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 550000, 600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000, 1000000,1100000,1200000,1300000,1400000,1500000,1600000,1700000,1800000,1900000, 2000000, 2500000, 3000000, 3500000, 4000000,4500000, 5000000,6000000,7000000,8000000,9000000, 10000000, 20000000, 30000000, 40000000, 50000000],
					rent_price = [50,75,100,125,150,175,200,225,250,275,300,325,350,375,400,425,450,475,500,525,550,575,600,625,650,675,700,725,750,800,850,900,950,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2500,3000,3500,4000,4500,5000],
					commercial_lease = [5000,10000,20000,25000,30000,35000,40000,45000,50000,60000,70000,80000,90000,100000,150000,200000,250000,500000,1000000,2000000],
					leasing_states = ["lease", "leased"],
					selling_states = ["sale", "sold"],

					minPriceEl = _propertyForm.find("select[name='min_price']"),
					maxPriceEl = _propertyForm.find("select[name='max_price']"),

					minPriceCurrentValue = minPriceEl.val(),
					maxPriceCurrentValue = maxPriceEl.val(),

					priceOptions = [],
					pricePrefix = "",

					minPlaceholderOption = minPriceEl.find('option').first(),
					maxPlaceholderOption = maxPriceEl.find('option').first();

				minPriceEl.empty(); minPriceEl.append(minPlaceholderOption);
				maxPriceEl.empty(); maxPriceEl.append(maxPlaceholderOption);

				if( category == 'commercial' && leasing_states.includes(state) ){
					priceOptions = commercial_lease;
					pricePrefix = " pa";
				} 
				else if( leasing_states.includes(state) ) priceOptions = rent_price;
				else if( selling_states.includes(state) ) priceOptions = sale_price;

				priceOptions.forEach((price) => {
					minPriceEl.append(`<option value="${price}">$${price.toLocaleString()}${pricePrefix}</option>`);
					maxPriceEl.append(`<option value="${price}">$${price.toLocaleString()}${pricePrefix}</option>`);
				});
				
				if( priceOptions.includes( Number( minPriceCurrentValue ) ) ){
					minPriceEl.val(minPriceCurrentValue).trigger('change');
				}
				if( priceOptions.includes( Number( maxPriceCurrentValue ) ) ){
					maxPriceEl.val(maxPriceCurrentValue);
				}
			},

			/**
             * updateLand()
             * 
             * Search form helper function to update land fields
             *
             * @param {jQuery} _propertyForm - The property search form element.
             * @param {string} category - The search form category type.
             */
			updateLand = function( _propertyForm, category ){
				let min_land = [200,300,400,500,600,700,800,900,1000,1200,1500,1750,2000,3000,4000,5000,10000,20000],
					max_land = [200,300,400,500,600,700,800,900,1000,1200,1500,1750,2000,3000,4000,5000,10000,20000,30000,40000,50000,100000,200000,300000,400000,500000,600000,700000,800000,900000],
					combusrur_land = [100,200,300,400,500,600,700,800,900,1000,1500,2000,3000,4000,5000,10000,20000,30000,50000,100000,500000],

					minLandEl = _propertyForm.find("select[name='min_land']"),
					maxLandEl = _propertyForm.find("select[name='max_land']"),

					minLandCurrentValue = minLandEl.val(),
					maxLandCurrentValue = maxLandEl.val(),

					minOptions = min_land,
					maxOptions = max_land,

					minPlaceholderOption = minLandEl.find('option').first(),
					maxPlaceholderOption = maxLandEl.find('option').first(),

					areaSizeFormat = function( value ){
						let suffix = "";
						if( value < 10000 ){
							suffix = "m2";
						} else {
							value = value / 10000;
							suffix = "ha";
						}

						return value.toLocaleString() + " " + suffix; 
					};

				minLandEl.empty(); minLandEl.append(minPlaceholderOption);
				maxLandEl.empty(); maxLandEl.append(maxPlaceholderOption);

				if( ['commercial','business','rural'].includes(category) ){
					minOptions = combusrur_land;
					maxOptions = combusrur_land;
				}

				minOptions.forEach((size) => {
					minLandEl.append(`<option value="${size}">${areaSizeFormat(size)}</option>`);
				});

				maxOptions.forEach((size) => {
					maxLandEl.append(`<option value="${size}">${areaSizeFormat(size)}</option>`);
				});
				
				if( minOptions.includes( Number( minLandCurrentValue ) ) ){
					minLandEl.val(minLandCurrentValue).trigger('change');
				}
				if( maxOptions.includes( Number( maxLandCurrentValue ) ) ){
					maxLandEl.val(maxLandCurrentValue);
				}
			},

			/**
             * switchActiveNav()
             * 
             * Search form helper function to switch active form tab navigation 
             *
             * @param {jQuery} formTab - The Search form tab element.
             * @param {jQuery} btn - The search form tab button element.
             */
			switchActiveNav = function (formTab, btn){
				formTab.children().removeClass('lp-active');
				btn.parent().addClass('lp-active');
			},

			/**
             * switchForm()
             * 
             * Search form helper function to switch form and update options
             *
             * @param {string} category - The Search form category type.
             * @param {string} searchType - The search type.
             * @param {string} action - The search form action link.
             * @param {string} buttonLabel - The search form Submit button label.
             * @param {string} placeholder - The search form Address Lookup field placeholder text.
             * @param {string} lookupTypes - The types of Address Lookup search.
             * @param {jQuery} _searchForm - The search form element.
             */
			switchForm = function( category, searchType, action, buttonLabel, placeholder, lookupTypes, _searchForm ){ 

				let allForm = _searchForm.find('.lp-form'),
					targetForm = _searchForm.find('.'+{
						'sale': 'rep-property-form',
						'lease': 'rep-property-form',
						'sold': 'rep-property-form',
						'leased': 'rep-property-form',
						'sell': 'rep-appraisal-form',
						'manage': 'rep-appraisal-form',
						'suburb_report': 'rep-appraisal-form',
						'employee': 'rep-employee-form',
						'team_member': 'rep-team-member-form',
						'agency': 'rep-agency-form',
						'office': 'rep-office-form',
						'suburb': 'rep-suburb-form',
					}[searchType]);
				
				// Update listing state value
				if( category != undefined && propertySearchTypes.includes( searchType ) ){
					_searchForm.find('input[name="search_category"]').val( category + " " + searchType );

					// Hide / Show listing category select field
					_searchForm.find('select.rep-listing-category').hide().prop("disabled", true);
					_searchForm.find('select.rep-listing-category-'+searchType).show().prop("disabled", false).val( category );

					// Hide / Show listing category select field
					_searchForm.find('ul.rep-sub-tab-listing-category').hide().find('.lp-tab-sub-nav').removeClass('lp-active');
					_searchForm.find('ul.rep-sub-tab-listing-category-'+searchType).show().find('.rep-property-sub-tab-'+category).addClass("lp-active");	
				} 

				allForm.parent().hide();
				allForm.removeClass('lp-active');
				
				if( targetForm !== null ){
					targetForm.parent().show();
					if( !targetForm.hasClass('lp-active') ) targetForm.addClass('lp-active');

					if( appraisalSearchTypes.includes( searchType ) || propertySearchTypes.includes( searchType ) ){

						// Update Property Form Action
						if( action ) 		targetForm.attr('action', action);
						if( placeholder ){
							targetForm.find('.lp-address-lookup').attr('placeholder', placeholder);
							targetForm.find('.lp-field-address .select2-search__field').attr('placeholder', placeholder);
						}
						if( buttonLabel ) 	targetForm.find('.lp-submit-button').text(buttonLabel);
						if( lookupTypes ) 	targetForm.find('.lp-address-lookup').attr('data-lookup-types', lookupTypes);

						if( appraisalSearchTypes.includes( searchType ) ){
							
							if( ['sell','manage'].includes( searchType ) ) targetForm.find('.lp-address-street').attr('disabled', false);
							else targetForm.find('.lp-address-street').attr('disabled', true);

							// Show/hide apprailal blurb based on the appraisal state
							_searchForm.find('.rep-appraisal-blurb').hide();
							_searchForm.find('.rep-appraisal-blurb-'+searchType).show();

						}

						if( propertySearchTypes.includes( searchType ) ){

							// Show/hide category based label and search type fields
							targetForm.find('[class*="rep-label-type-"]').hide();
							targetForm.find('.rep-label-type-'+category).show();

							targetForm.find('.rep-search-type').hide().prop("disabled", true).find('*').prop("disabled", true);
							targetForm.find('.rep-search-type-'+category).show().prop("disabled", false).find('*').prop("disabled", false);

							if( targetForm.find('.rep-property-type:not(:disabled)').length > 0 ){
								targetForm.find('.rep-property-types').show();
								targetForm.find('[name="property_type"]').prop("disabled", false);
							} else {
								targetForm.find('.rep-property-types').hide();
								targetForm.find('[name="property_type"]').prop("disabled", true);
							}

							// Show/hide apprailal blurb based on the property state
							_searchForm.find('.rep-property-blurb').hide();
							_searchForm.find('.rep-property-blurb-'+searchType).show();

							updatePrice( targetForm, searchType, category );
							updateLand( targetForm, category );

						}
					}
				}
			};

		/*****************************
		 # REP Search Form Events - START
		 * ***************************/ 
		// Update form on listing category nav selection
		searchForm.on('click', '.rep-sub-btn-listing-category', function(){
			let btn = $(this),
				search_category = btn.closest('.rep-search-form').find('.lp-form.lp-active').find('[name="search_category"]').val().split(" "),
				state = search_category[1],
				tab = btn.closest('.lp-search-form-tabs,.lp-search-form-sub-tabs');
			
			// Switch Active Tab
			switchActiveNav( tab, btn );

			// Switch Form
			switchForm( 
				btn.data("listing-category"), state, btn.data("ls-link"), 
				btn.data("button-label"), btn.data("placeholder"), btn.data("lookup-types"), searchForm 
			);
		});

		// Update form on search type nav selection
		searchForm.on('click', '.rep-btn-search-type', function(){
			let btn = $(this),
				type = btn.data('search-type'),
				tab = btn.closest('.lp-search-form-tabs,.lp-search-form-sub-tabs'),
				lastActiveForm = searchForm.find('.lp-form.lp-active'),
				targetForm = propertySearchTypes.includes( type ) ? searchForm.find('.rep-property-form') : lastActiveForm,
				modal = btn.closest('.lp-modal');

			// Switch Active Tab
			switchActiveNav(tab, btn);

			if( modal.length ){ 
				let modal = btn.closest('.lp-modal'),
					stateListingCategory = modal.find('.rep-sub-tab-listing-category-'+type),
					selectedCategory = stateListingCategory.prop("tagName") == 'UL' ? stateListingCategory.find('.lp-tab-sub-nav.lp-active').children('button') : stateListingCategory;

				if( ! selectedCategory.length ){
					selectedCategory = stateListingCategory.find('.lp-tab-sub-nav').first().children('button');	
				}

				// Switch Form
				switchForm( 
					selectedCategory.data('listing-category'), type, selectedCategory.data('ls-link'), 
					selectedCategory.data('button-label'), selectedCategory.data('placeholder'), selectedCategory.data("lookup-types"), modal 
				);
			} else {
				let stateListingCategory = ! lastActiveForm.hasClass('rep-property-form') ? 
						targetForm.find('.rep-listing-category-'+type) : lastActiveForm.find('.rep-listing-category-'+type),
					selectedCategory = stateListingCategory.prop("tagName") == 'SELECT' ? stateListingCategory.find(':selected') : stateListingCategory,
					buttonLabel = selectedCategory.data('button-label'),
					placeholder = selectedCategory.data('placeholder'),
					action = selectedCategory.data('ls-link'),
					lookupTypes = selectedCategory.data("lookup-types");

				if( ['employee','team_member','agency','office','suburb'].includes(type) || appraisalSearchTypes.includes(type) ){
					buttonLabel = btn.data('button-label');
					placeholder = btn.data('placeholder');
					action = btn.data('ls-link');
					lookupTypes = btn.data('lookup-types');
				}

				// Switch Form
				switchForm( selectedCategory.val(), type, action, buttonLabel, placeholder, lookupTypes, searchForm );
			}

		});

		// Switch form as listing category selection changes
		searchForm.on('change', '.rep-listing-category', function(){
			let selectField = $(this),
				selected = selectField.find(":selected"),
				activeForm = selectField.closest('.lp-form'),
				search_category = activeForm.find('input[name="search_category"]').val().split(" "),
				state = search_category[1];

			// Switch Form
			switchForm( 
				selectField.val(), state, selected.data("ls-link"), 
				selected.data("button-label"), selected.data("placeholder"), selected.data("lookup-types"), searchForm
			);
		});

		// Switch form and update modal as property filter button changes
		propertyForm.on('click', '.rep-property-filter-button', function(){
			searchFormModal.each( function(){
				let modal = $(this),
					modalPropertyForm = modal.find('.rep-property-form'),
					activeTabNav = searchForm.find('.lp-tab-nav.lp-active'),
					typeTabNavBtn = activeTabNav.find('.rep-btn-search-type'),

					syncValuesToModal = function(){
						modalPropertyForm.find('.rep-field-search-locations').each(function(){
							let field = $(this),
								select = field.find('select'),
								selectedLocations = propertyForm.find('.rep-locations-value').val(); 

							if( selectedLocations ) selectedLocations = selectedLocations.split(",");
							else selectedLocations = [];

							select.val( selectedLocations ).trigger('change').trigger({
								type: 'select2:select',
								params: {
									data: {id: selectedLocations },
								}
							});
						});

						modalPropertyForm.find('.lp-field-lookup,.lp-field-address-lookup').each(function(){
							let field = $(this),
								addressInput = field.find('input'),
								selectedAddress = propertyForm.find('.lp-field-lookup,.lp-field-address-lookup'); 

							addressInput.each( function(){
								let input = $(this);

								input.val( selectedAddress.find('[name="'+input.attr('name')+'"]').val() );
							});
						});
					};

				if( typeTabNavBtn.length ){
					let type = typeTabNavBtn.data('search-type'),
						btn = modal.find('.rep-btn-search-type[data-search-type="'+type+'"]'),
						activeStateCategory = propertyForm.find('.rep-listing-category-'+type),
						activeCategory = activeStateCategory.prop("tagName") == 'SELECT' ? activeStateCategory.find(':selected') : activeStateCategory,
						modalTab = btn.closest('.lp-tab-navs'),
						modalSubTab = modal.find('.rep-sub-tab-listing-category-'+type);

					// Sync Values from Inline Property Form to Modal Form
					syncValuesToModal();

					// Switch Active Tab
					switchActiveNav(modalTab, btn);

					// Switch Form
					switchForm( activeStateCategory.val(), type, activeCategory.data('ls-link'), 
						activeCategory.data("button-label"), activeCategory.data("placeholder"), activeCategory.data("lookup-types"), modal 
					);

				}
			});
		});

		// Limit max field selectable value
		searchForm.on('change', '[name="min_price"],[name="min_land"],[name="min_floor"]', function(){
			let minField = $(this),
				minFieldValue = Number( minField.val() ),
				maxField = minField.closest('.lp-field').next().children('.lp-select');

			maxField.find('option').each( function(){
				let option = $(this),
					maxFieldValue = Number( option.attr('value') );
				
				if( maxFieldValue < minFieldValue && option.attr('value') !== "" ) option.hide();
				else option.show();
			});
		});

		// Update type value on property type selection change
		propertyForm.on('change', '.rep-search-type.rep-property-type', function(){
			propertyForm.find('input[name="property_type"]').val( $(this).val() );
		});

		// Search location field event handler
		searchForm.find('.rep-field-search-locations').each(function(){
			let field = $(this),
				select = field.find('select'),
				hidden_field = field.find('.rep-locations-value'),
				placeholder = select.data('placeholder'),
				selectedLocations = hidden_field.val();

			if( selectedLocations ) selectedLocations = selectedLocations.split(",");
			else selectedLocations = [];

			select.select2({
				placeholder: (placeholder != '' ? placeholder : "Select Locations"),
				multiple: true,
				selectionCssClass: 'lp-select2-select rep-select2-select-search-locations',
				dropdownCssClass: 'lp-select2-dropdown rep-select2-dropdown-search-locations',
				sorter: function (data) {
		            // Separate matches and non-matches
		            var startsWithTerm = [];
		            var containsTerm = []; 
		            var select2data = field.find(".select2-search__field").val();

		            var term = select2data ? select2data.toUpperCase() : "";

		            $.each(data, function (index, item) {
		                var text = item.text.toUpperCase();
		                if (text.indexOf(term) === 0) {
		                    startsWithTerm.push(item);
		                } else {
		                    containsTerm.push(item);
		                }
		            });

		            return startsWithTerm.concat(containsTerm);
		        }
			}).val( selectedLocations ).on('change', function (e) {
				field.find("ul.select2-selection__rendered").each(function(){
					let select2Select = $(this),
						locations = [],
						hidden_selected_count = 0,
						select2parent = select2Select.parent(),
						moreLabel = select2parent.find('.lp-more-selected-label');
					
					select2Select.children("li[title]").each(function(i, obj){
						let selected = $(this).attr('title');
							locations.push(selected); 

						if(i <= 1) $(this).show();
						else {
							hidden_selected_count++;
							$(this).hide();
						}                    
					}); 
					hidden_field.val(locations);

					if(hidden_selected_count){
						let moreTextDisplay = 'And '+hidden_selected_count+' more';

						if(moreLabel.length){
							moreLabel.attr('data-selected-count', hidden_selected_count);
							moreLabel.html(moreTextDisplay);
						} else {
							select2parent.append('<span class="lp-more-selected-label" data-selected-count="'+hidden_selected_count+'">'+moreTextDisplay+'</span>');
						}
					} else {
						moreLabel.remove();
					}
				});
			}).trigger('change').trigger({
				type: 'select2:select',
				params: {
					data: {id: selectedLocations },
				}
			});                        
		});

		// Update type value on property type selection change
		searchForms.on('change', '.rep-include-surroundings', function(){

			const $check_stat = $(this).prop('checked');

			// Apply value change to all search forms include surrounding suburb checkbox
			searchForms.find('.rep-include-surroundings').prop( 'checked', $check_stat );

			if( $check_stat == true ){
				propertyForm.find('.rep-field-search-locations').hide().prop("disabled", true).find('*').prop("disabled", true);
				propertyForm.find('.lp-field-address-lookup').show().prop("disabled", false).find('*').prop("disabled", false);
			} else {
				propertyForm.find('.rep-field-search-locations').show().prop("disabled", false).find('*').prop("disabled", false);
				propertyForm.find('.lp-field-address-lookup').hide().prop("disabled", true).find('*').prop("disabled", true);
			}

		});

		searchablePropertyElement.each( function(){
			let propertyElement = $(this),
				total_records = propertyElement.find('span[data-total-records]'),
				result_count = propertyElement.find('span[data-result-count]'),
				per_page = propertyElement.find('span[data-per-page]').data('per-page');

			if(total_records.length > 0){
				$("#property_listing_count span.count").html(result_count.data("result-count"));
				if(parseInt(per_page) > parseInt(total_records.data("total-records"))){
					$(".element-property-search").fadeOut(function(){
						$("body").removeClass("lp-has-search-filter");    
					});    
				}
			}
		});

		// Handles search form field to submit
		searchForm.on('submit', 'form', function(e){
			e.preventDefault(); // Prevent the default form submission

		    // Get the form element
		    const form = $(this);

		    // Create a FormData object from the form
    		const formData = new FormData(form[0]);

		    // Create an array to store parameter strings
    		const params = [];

		    // Iterate through the form data entries
		    formData.forEach((value, name) => {
		        value = value.trim(); // Trim whitespace

		        // Check if the field value is empty (except for 0)
		        if (value !== '') {
		        	if( name == 'search_location' ){
		        		value = value.replace(/, /g,' ');
		        	}
		            params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
		        }
		    });

		    // Construct the final URL with the parameters
    		const finalURL = `${form.attr('action')}?${params.join('&')}`;

		    // Redirect to the final URL
    		window.location.href = finalURL;
		});

		/*****************************
		 ! REP Search Form Events - END
		 * ***************************/ 
	} );

	/*****************************
	 ! REP Search Form - END
	 * **************************/
});