$(function() {
  $('#file').change(function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function() {
      var data = reader.result
      nbt.parse(data, function(error, data) {
        if (error) {
          throw error;
        }

        console.log(JSON.stringify(data));
      });
    }

    reader.readAsArrayBuffer(file);
  });
});