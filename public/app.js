
$(document).ready(function () {
  $('#show-form-button').click(function (event) {
    event.preventDefault();
    $('.toggle-value').attr('type', 'text');
    $('#save-data').toggle();
    $('#show-form-button').toggle()
  });
});
