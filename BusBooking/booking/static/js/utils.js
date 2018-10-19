var to_title_case = function(text) {
  text = text.replace(/\w*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  return text;
}

var get_today_date_12_am = function() {
  today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  today.setMilliseconds(0)
  return today
}

var get_date_obj_from_str = function(date_str) {
  date_arr = date_str.split('/')
  for (i in date_arr) {
    date_arr[i] = parseInt(date_arr[i])
  }
  return new Date(date_arr[2], date_arr[1] - 1, date_arr[0])
}

var set_error_message = function(name, message) {
  /*
    Set error message to the respective input's error element
  */

  $('[name="' + name + '"]').siblings('.error').text(message).show();
}
