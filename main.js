$(function() {
  console.log('test');
  $("#file").change(function(e) {
    var result = e.target.files[0];
    var reader = new FileReader();
    console.log("test");
  });
});