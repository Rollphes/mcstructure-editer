$("#editfile").addEventListener('change', function(e) {
  var result = e.target.files[0];
  var reader = new FileReader();
  console.log("test");
  if (result.name.slice(-12) == ".mcstructure") {
    reader.onload = function (evt) {
      var allData = evt.target.result; //ファイル内容を全て取得
      var bin = "";
      for (var i = 0; i < allData.length; i++) {
        var s = allData.charCodeAt(i); //16進数で表示
        if (s == 10) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          $('<p></p>').html("Compound:name=" + tagname_result).prependTo('#logs');
          i += (2 + tagname_count);
          continue;
        }
        if (s == 0) {
          $('<p></p>').html("End").prependTo('#logs');
          continue;
        }
        if (s == 8) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          let value_count = allData.charCodeAt(i + 2 + tagname_count + 2) * 16 + allData.charCodeAt(i + 1 + tagname_count + 2);
          let value = [];
          for (value_loop = 1; value_loop <= value_count; value_loop++) {
            value.push(String.fromCharCode(allData.charCodeAt(i + 2 + value_loop + tagname_count + 2)));
          }
          let value_result = value.join(``);
          $('<p></p>').html("String:name=\"" + tagname_result + " value=\"" + value_result + "\"").prependTo('#logs');
          i += (2 + tagname_count + 2 + value_count);
          continue;
        }
        if (s == 1) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          let value_count = 1;
          let value_result = value(i, value_count, tagname_count, allData);
          $('<p></p>').html("Byte:name=\"" + tagname_result + "\" value=" + value_result).prependTo('#logs');
          i += (2 + tagname_count + value_count);
          continue;
        }
        if (s == 2) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          let value_count = 2;
          let value_result = value(i, value_count, tagname_count, allData);
          $('<p></p>').html("Short:name=\"" + tagname_result + "\" value=" + value_result).prependTo('#logs');
          i += (2 + tagname_count + value_count);
          continue;
        }
        if (s == 3) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          let value_count = 4;
          let value_result = value(i, value_count, tagname_count, allData);
          $('<p></p>').html("Int:name=\"" + tagname_result + "\" value=" + value_result).prependTo('#logs');
          i += (2 + tagname_count + value_count);
          continue;
        }
        if (s == 4) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          let value_count = 8;
          let value_result = value(i, value_count, tagname_count, allData);
          $('<p></p>').html("Long:name=\"" + tagname_result + "\" value=" + value_result).prependTo('#logs');
          i += (2 + tagname_count + value_count);
          continue;
        }
        if (s == 5) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          let value_count = 4;
          let value = [];
          for (value_loop = value_count; value_loop >= 1; value_loop--) {
            value.push((`00000000` + allData.charCodeAt(i + value_loop + tagname_count + 2).toString(2)).slice(-8));
          }
          let value_result = value.join(``);
          let value_sign = value_result.slice(0, 1);
          let value_exponent = value_result.slice(1, 9);
          let value_fraction = value_result.slice(9);
          value_result = ((-1) ** value_sign) * parseInt("1" + value_fraction, 2) * (2 ** -23) * (2 ** (parseInt(value_exponent, 2) - 127));
          if (value_result <= 1.0 * (2 ** -127)) {
            value_result = -0.0;
          }
          $('<p></p>').html("Float:name=\"" + tagname_result + "\" value=" + value_result).prependTo('#logs');
          i += (2 + tagname_count + value_count);
          continue;
        }
        if (s == 6) {
          let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
          let tagname_result = tagname(i, tagname_count, allData);
          let value_count = 8;
          let value = [];
          for (value_loop = value_count; value_loop >= 1; value_loop--) {
            value.push((`00000000` + allData.charCodeAt(i + value_loop + tagname_count + 2).toString(2)).slice(-8));
          }
          let value_result = value.join(``);
          let value_sign = value_result.slice(0, 1);
          let value_exponent = value_result.slice(1, 12);
          let value_fraction = value_result.slice(12);
          value_result = ((-1) ** value_sign) * parseInt("1" + value_fraction, 2) * (2 ** -52) * (2 ** (parseInt(value_exponent, 2) - 127));
          if (value_result <= 1.0 * (2 ** -1023)) {
            value_result = -0.0;
          }
          $('<p></p>').html("Double:name=\"" + tagname_result + "\" value=" + value_result).prependTo('#logs');
          i += (2 + tagname_count + value_count);
          continue;
        }
        /*if (s == 9) {
            let tagname_count = allData.charCodeAt(i + 2) * 16 + allData.charCodeAt(i + 1);
            let tagname_result = tagname(i,tagname_count);
            let value_type = allData.charCodeAt(i + 2 + 1 + tagname_count);
        }*/
      }
    }
  }
});