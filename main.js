$(function() {
  $('#file').change(function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    console.log('test');
    reader.onload = function() {
      var data = reader.result;
      nbt.parse(data, function(error, data) {
        if (error) {
          throw error;
        }

        console.log(data.value.stringTest.value);
        console.log(data.value['nested compound test'].value);
      });
    }

    reader.readAsArrayBuffer(file);
  });
});