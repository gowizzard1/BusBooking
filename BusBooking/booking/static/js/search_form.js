$(document).ready(function(){

  $.ajax({
    'url': '/booking/api/locations/',
    'async': false,
    'success': function(res) {
      let keywords_list = [];
      for (let i=0; i<res.length; i++) {
        keywords_list.push(res[i]['name']);
      }
      // Initialize auto complete for location fields
      $('.from-location-input').autocomplete({
        source: keywords_list,
        minLength: 1
      });
      $('.to-location-input').autocomplete({
        source: keywords_list,
        minLength: 1
      });
      // Will be used in search_results.js to validate search form
      // and also in the event below
      sessionStorage.setItem('locations', JSON.stringify(keywords_list));
    },
    'error': function(xhr, msg, exc) {
      console.log(xhr)
      console.log(msg)
      console.log(exc)
    }
  });

  // Initialize datepicker for schedule fields
  $('.onward-date').inputmask('99/99/9999');
  $('.onward-date').datepicker({
    dateFormat: 'dd/mm/yy',
    minDate: new Date()
  });

  $('.return-date').inputmask('99/99/9999');
  $('.return-date').datepicker({
    dateFormat: 'dd/mm/yy',
    minDate: new Date()
  });

})

$(document).on('change', '.onward-date', function(event) {
  // Return date must always be greater than journey start date
  $('.return-date').datepicker("option", "minDate", get_date_obj_from_str(event.target.value));
});

$(document).on('change', '.from-location-input,.to-location-input', function(event) {
  let locations = JSON.parse(sessionStorage.getItem('locations'));
  let location_input_class , sibling_location_input_class;
  // Identify selected location field
  if (event.target.name == 'from_location') {
    location_input_class = '.from-location-input';
    sibling_location_input_class = '.to-location-input';
  }
  else {
    location_input_class = '.to-location-input';
    sibling_location_input_class = '.from-location-input';
  }
  // Reset auto complete options. Selected from and to location must not be same.
  $(location_input_class).autocomplete("option", "source", locations);
  $(sibling_location_input_class).autocomplete("option", "source", locations.filter(function(item) {
    return item !== event.target.value;
  }));
  // Reset the other location field if from and to location are same.
  if (event.target.value == $(sibling_location_input_class)[0].value) {
    $(sibling_location_input_class)[0].value = '';
  }
});

$(document).on('change', '.from-location-input,.to-location-input,.onward-date,.return-date', function(event) {
  // Set input change flag. API call need not be made unless input has changed.
  sessionStorage.setItem('input-changed', true)
});
