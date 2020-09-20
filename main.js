$(function() {
  $('#file').change(function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    console.log('test');
    reader.onload = function() {
      var ar = new Uint8Array(reader.result);
    }

    reader.readAsArrayBuffer(file);
  });
});