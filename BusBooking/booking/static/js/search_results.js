var validate_date_input = function(date_str) {
  /*
    This method accepts a string in format dd/mm/yyyy
    and checks if it is valid date.
  */

  date_obj = get_date_obj_from_str(date_str)
  if (
    date_obj &&
    date_obj.getDate() == date_arr[0] &&
    date_obj.getMonth() == date_arr[1] - 1 &&
    date_obj.getFullYear() == date_arr[2]
  ) {
    return true
  }
  return false
}

var validate_search_parameters = function(form_data) {
  let locations = JSON.parse(sessionStorage.getItem('locations'));
  let validated = true;

  // `From` and `To` location must be present and
  // location entered must be an allowed loction.
  if (
    !form_data['from_location'] ||
    locations.indexOf(form_data['from_location']) == -1
  ) {
    set_error_message (
      "from_location",
      "Please type to search and select a location from the dropdown"
    )
    validated = false;
  }

  if (
      !form_data['to_location'] ||
      locations.indexOf(form_data['to_location']) == -1
  ) {
    set_error_message (
      "to_location",
      "Please type to search and select a location from the dropdown"
    )
    validated = false;
  }

  // Onward date must be present
  if (!form_data['onward_date']) {
    set_error_message (
      "onward_date",
      "Please select your travel date"
    )
    validated = false;
  }
  else {
    // Onward date must be valid
    if (!validate_date_input(form_data['onward_date'])) { 
      set_error_message (
        "onward_date",
        "Please enter a valid travel date or choose a date from the datepicker"
      )
      validated = false;
    }
    // Onward date must be today or after
    else if (get_date_obj_from_str(form_data['onward_date']) < get_today_date_12_am()){
      set_error_message (
        "onward_date",
        "Travel date must be today or after"
      )
      validated = false;
    }
  }

  if (form_data['return_date']) {
    // Return date must be valid
    if (!validate_date_input(form_data['return_date'])) {
      set_error_message (
        "return_date",
        "Please enter a valid future return date or choose a date from the datepicker"
      )
      validated = false;
    }
    // Return date must be travel date or after
    else if (
      get_date_obj_from_str(form_data['return_date']) < get_today_date_12_am() ||
      get_date_obj_from_str(form_data['return_date']) < get_date_obj_from_str(form_data['onward_date'])
    ){
      set_error_message (
        "return_date",
        "Return date must be travel date or after"
      )
      validated = false;
    }
  }
  
  return validated;
}

var reset_filters = function() {
  $('form.filter-form')[0].reset();
  // Reset price range filter.
  $('.price-range-display').hide();
  let price_slider_options = $("#price-slider").slider('option');
  $("#price-slider").slider("option", "values", [price_slider_options.min, price_slider_options.min]);
  // Reset rating range filter.
  $('.rating-range-display').hide();
  let rating_slider_options = $("#rating-slider").slider('option');
  $("#rating-slider").slider( "option", "values", [ rating_slider_options.min, rating_slider_options.min ] );
}

var get_time_diff_string = function(start, stop) {
  start = new Date(start);
  stop = new Date(stop);
  let time_diff = (stop - start);
  // let num_seconds = parseInt(time_diff % (1000*60) / 1000);
  let num_minutes = parseInt((time_diff % (1000*60*60)) / (1000*60));
  let num_hours = parseInt((time_diff % (1000*60*60*24)) / (1000*60*60));
  let num_days = parseInt(time_diff % (1000*60*60*24*7) / (1000*60*60*24));
  let travel_time = '';
  // if (num_seconds) { travel_time = num_seconds + 's ' + travel_time; }
  let extra_hour = 0;
  if (num_minutes > 30) { extra_hour = 1 }
  if (num_hours) { travel_time = (num_hours + extra_hour) + 'h '; }
  if (num_days) { travel_time = num_days + 'd ' + travel_time; }
  return travel_time;
}

var get_search_result_item = function(brand, type, ac_available, onward_date, return_date, rating, seats, price) {
  /* 
    Used as a dynamic DOM generation method for a schedule item.
  */

  onward_date = new Date(onward_date);
  return_date = new Date(return_date);
  let onward_time = onward_date.getHours() + ":" + onward_date.getMinutes();
  let return_time = return_date.getHours() + ":" + return_date.getMinutes();
  let travel_time = get_time_diff_string(onward_date, return_date);
  let rating_star = '<i class="fas fa-star"></i>';
  let rating_html = '';
  if (ac_available == true) {
    ac = "A/C"
  }
  else {
    ac = "Non A/C"
  }
  for (i=0; i<rating; i++) {
    rating_html = rating_html + rating_star;
  }

  let search_result_item = $('#search-result-row').clone();
  search_result_item.find('.brand-name').text(brand)
  search_result_item.find('.bus-type').text(type + " | " + ac)
  search_result_item.find('.timings').text(onward_time + " -> " + return_time)
  search_result_item.find('.travel-time').text(travel_time)
  search_result_item.find('.rating').html(rating_html)
  search_result_item.find('.seats').text(seats + " seats")
  search_result_item.find('.price').text("INR " + price)
  search_result_item.removeClass('hide')

  return search_result_item;
}

var apply_schedules = function(schedules) {
  /*
    Loop over schedules, generate DOM element and append to schedules container
  */

  // Onward Schedules
  $('#search-results-onward').html('');
  $('#search-results-return').html('');
  if (schedules.schedules_onward.length == 0) {
    let empty_schedule_dom = $('#empty-schedule-template').clone();
    empty_schedule_dom.removeClass('hide');
    $('#search-results-onward').html(empty_schedule_dom)
  }
  else {
    for (let index in schedules['schedules_onward']) {
      let schedule = schedules['schedules_onward'][index];
      $('#search-results-onward').append(
        get_search_result_item(
          schedule['bus']['brand']['name'],
          to_title_case(schedule['bus']['type']),
          schedule['bus']['ac'],
          schedule['departure_time'],
          schedule['arrival_time'],
          schedule['bus']['rating'],
          schedule['bus']['num_rows'] * (schedule['bus']['num_lcols'] + schedule['bus']['num_rcols']),
          schedule['price']
        )
      );
    }
  }
  // Return Schedules
  if (schedules.schedules_return.length == 0) {
    let empty_schedule_dom = $('#empty-schedule-template').clone();
    empty_schedule_dom.removeClass('hide');
    $('#search-results-return').html(empty_schedule_dom)
  }
  else {
    for (let index in schedules['schedules_return']) {
      let schedule = schedules['schedules_return'][index];
      $('#search-results-return').append(
        get_search_result_item(
          schedule['bus']['brand']['name'],
          to_title_case(schedule['bus']['type']),
          schedule['bus']['ac'],
          schedule['departure_time'],
          schedule['arrival_time'],
          schedule['bus']['rating'],
          schedule['bus']['num_rows'] * (schedule['bus']['num_lcols'] + schedule['bus']['num_rcols']),
          schedule['price']
        )
      );
    }
  }
}

var filter_schedules = function(filter_dict) {
  let schedules = JSON.parse(sessionStorage.getItem('schedules'));
  if (filter_dict.hasOwnProperty('bus_type') && !Array.isArray(filter_dict['bus_type'])) {
    filter_dict['bus_type'] = Array(filter_dict['bus_type'])
  }

  if (filter_dict.hasOwnProperty('ac') && !Array.isArray(filter_dict['ac'])) {
    filter_dict['ac'] = Array(filter_dict['ac'])
  }

  let filtered_onward_schedules = schedules.schedules_onward.filter(function(schedule) {
    if (filter_dict.hasOwnProperty('price_lte') && schedule.price > filter_dict['price_lte']) return false;
    if (filter_dict.hasOwnProperty('price_gte') && schedule.price < filter_dict['price_gte']) return false;
    if (filter_dict.hasOwnProperty('rating_lte') && schedule.bus.rating > filter_dict['rating_lte']) return false;
    if (filter_dict.hasOwnProperty('rating_gte') && schedule.bus.rating < filter_dict['rating_gte']) return false;
    if (filter_dict.hasOwnProperty('bus_type') && filter_dict['bus_type'].indexOf(schedule.bus.type) == -1) return false;
    if (filter_dict.hasOwnProperty('ac') && filter_dict['ac'].indexOf("" + schedule.bus.ac) == -1) {
      return false;
    }
    return true;
  });

  let filtered_return_schedules = schedules.schedules_return.filter(function(schedule) {
    if (filter_dict.hasOwnProperty('price_lte') && schedule.price > filter_dict['price_lte']) return false;
    if (filter_dict.hasOwnProperty('price_gte') && schedule.price < filter_dict['price_gte']) return false;
    if (filter_dict.hasOwnProperty('rating_lte') && schedule.bus.rating > filter_dict['rating_lte']) return false;
    if (filter_dict.hasOwnProperty('rating_gte') && schedule.bus.rating < filter_dict['rating_gte']) return false;
    if (filter_dict.hasOwnProperty('bus_type') && filter_dict['bus_type'].indexOf(schedule.bus.type) == -1) return false;
    if (filter_dict.hasOwnProperty('ac') && filter_dict['ac'].indexOf("" + schedule.bus.ac) == -1) return false;
    return true;
  });

  apply_schedules({
    "schedules_onward": filtered_onward_schedules,
    "schedules_return": filtered_return_schedules
  });
}

$(document).ready(function() {
  
  // Hide the search filters and results container.
  // This will be shown upon successfull search.
  $('.search-filters-results-container').hide();

  // Do not display the range unless user selects an input
  $('.price-range-display').hide();
  $('.rating-range-display').hide();

  // Hide all error elements
  $('.error').hide();

  // Slider for bus rating
  $("#rating-slider").slider({
    'range': true,
    'min': 1,
    'max': 5,
    'step': 0.5,
    'create': function(event, ui) {
      // Initialize corresponding input fields with maximum range
      $('input[name="rating_gte"]')[0].value = 0;
      $('input[name="rating_lte"]')[0].value = 5;
    },
    'slide': function(event, ui) {
      // Display selection range and set corresponding input fields
      $('.rating-range-display').show()
      $("#rating-from").text(ui.values[0])
      $('input[name="rating_gte"]')[0].value = ui.values[0];
      $("#rating-to").text(ui.values[1])
      $('input[name="rating_lte"]')[0].value = ui.values[1];
    }
  });

  // This class was added to prevent `search-filters-results-container`
  // from showing for a while before JQuery hid it.
  $('.search-filters-results-container').removeClass('hide')
});

$(document).on('submit', '.search-form', function(event) {
  event.preventDefault();

  let form_data = JSON.parse('{"' + decodeURIComponent($(this).serialize()).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

  $('.error').hide();

  if (!validate_search_parameters(form_data)) {
    return;
  }

  if (!JSON.parse(sessionStorage.getItem('input-changed'))) {
    return;
  }

  $.ajax({
    'url': '/booking/api/schedules/',
    'type': 'POST',
    'data': form_data,
    'async': false,
    'success': function(schedules) {
      console.log(schedules);
      let prices = [];

      if (!form_data['return_date']) {
        $('.return-button').addClass('disabled');
      }
      else {
       $('.return-button').removeClass('disabled'); 
      }

      apply_schedules(schedules);

      // Collect all prices in a set this will help set range for
      // price filter. Range is set to nearest 100 for both limits.
      for (let index in schedules['schedules_onward']) {
        prices.push(schedules['schedules_onward'][index]['price']);
      }
      for (let index in schedules['schedules_return']) {
        prices.push(schedules['schedules_return'][index]['price']);
      }
      prices.sort()

      let min_price = prices[0];
      min_price = min_price - (min_price % 100)
      let max_price = prices[prices.length - 1];
      max_price = max_price - (max_price % 100) + 100
      // Slider for price
      $("#price-slider").slider({
        'range': true,
        'min': min_price,
        'max': max_price,
        'create': function(event, ui) {
          // Initialize corresponding input values with maximum range
          $('input[name="price_gte"]')[0].value = min_price;
          $('input[name="price_lte"]')[0].value = max_price;
        },
        'slide': function(event, ui) {
          // Display selection range and set corresponding input fields
          $('.price-range-display').show();
          $('#price-from').text(ui.values[0]);
          $('input[name="price_gte"]')[0].value = ui.values[0];
          $('#price-to').text(ui.values[1]);
          $('input[name="price_lte"]')[0].value = ui.values[1];
        }
      });

      $('.schedule-details').text(form_data['from_location'] + " -> " + form_data['to_location']);
      // Show onward travel results first.
      $('#search-results-onward').show();
      $('.onward-button').addClass('active');
      // Hide return travel results. User need to click a button to see this.
      $('#search-results-return').hide();
      $('.return-button').removeClass('active');

      reset_filters();

      // Move search form to the top and make space for and show the search results.
      $('.search-form-div').animate({
        'margin-top': 0
      }, 500, function(){
        $('.search-filters-results-container').fadeIn(100);
      });

      // Make an API call to get schedules only if input has changed.
      sessionStorage.setItem('input-changed', false)
      // Store schedules in the sessionStore. This will be used for filter events.
      sessionStorage.setItem('schedules', JSON.stringify(schedules))
    },
    'error': function(xhr, msg, exc) {
      console.log(xhr)
      console.log(msg)
      console.log(exc)
    }
  });
})

$(document).on('submit', '.filter-form', function(event) {
  event.preventDefault();
  // Returns a string with multiple fields as `key=value` separated by `&`
  let form_data_str = $(this).serialize();
  if (form_data_str) {
    // Returns a list of `key=value` strings
    let form_data_arr = form_data_str.split("&");
    let filter_dict = {};
    for (field in form_data_arr) {
      let field_name = form_data_arr[field].split("=")[0];
      let field_value = form_data_arr[field].split("=")[1];
      // For multiple `key=value` with same key, store values as an array
      if (filter_dict.hasOwnProperty(field_name)) {
        if (Array.isArray(filter_dict[field_name])) {
          filter_dict[field_name].push(field_value);
        }
        else {
          filter_dict[field_name] = Array(filter_dict[field_name]);
          filter_dict[field_name].push(field_value);
        }
      }
      // Store `key=value`.
      else {
        filter_dict[field_name] = field_value;
      }
    }
    filter_schedules(filter_dict);
    sessionStorage.setItem('input-changed', true)
  }
});

// Toggle between onward and return
$(document).on('click', '.onward-button', function(event){
  let schedule_details_text = $('.schedule-details').text();
  $('.schedule-details').text(schedule_details_text.split(' -> ').reverse().join(' -> '));
  $('#search-results-onward').show();
  $('.onward-button').addClass('active');
  $('#search-results-return').hide();
  $('.return-button').removeClass('active');
});

$(document).on('click', '.return-button', function(event){
  if (!$(event.target).hasClass('disabled')) {
    let schedule_details_text = $('.schedule-details').text();
    $('.schedule-details').text(schedule_details_text.split(' -> ').reverse().join(' -> '));
    $('#search-results-return').show();
    $('.return-button').addClass('active');
    $('#search-results-onward').hide();
    $('.onward-button').removeClass('active');
  }
});
