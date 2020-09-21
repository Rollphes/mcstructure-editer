$(function() {
  $('#file').change(function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    console.log('test');
    reader.onload = function() {
      var data = reader.result
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
var mcs = {};
mcs.parse = function(buffer) {
  if (!buffer) {
    throw new Error('Argument "buffer" is falsy');
  }

  var self = this;
  this.offset = 0;

  var arrayView = new Uint8Array(buffer);
  var dataView = new DataView(arrayView.buffer);
  function read(dataType, size) {
    var val = dataView['get' + dataType](self.offset);
    self.offset += size;
    return val;
  }

}