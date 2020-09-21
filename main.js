$(function() {
  $('#file').change(function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    console.log('test');
    reader.onload = function() {
      var data = reader.result
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

  this[nbt.tagTypes.byte] = read.bind(this, 'Int8', 1);

  this.ubyte = read.bind(this, 'Uint8', 1);

  this[nbt.tagTypes.short] = read.bind(this, 'Int16', 2);

  this[nbt.tagTypes.int] = read.bind(this, 'Int32', 4);

  this[nbt.tagTypes.float] = read.bind(this, 'Float32', 4);

  this[nbt.tagTypes.double] = read.bind(this, 'Float64', 8);

  this[nbt.tagTypes.long] = function() {
    return [this.int(),
      this.int()];
  };

  this[nbt.tagTypes.byteArray] = function() {
    var length = this.int();
    var bytes = [];
    var i;
    for (i = 0; i < length; i++) {
      bytes.push(this.byte());
    }
    return bytes;
  };

  this[nbt.tagTypes.intArray] = function() {
    var length = this.int();
    var ints = [];
    var i;
    for (i = 0; i < length; i++) {
      ints.push(this.int());
    }
    return ints;
  };

  this[nbt.tagTypes.longArray] = function() {
    var length = this.int();
    var longs = [];
    var i;
    for (i = 0; i < length; i++) {
      longs.push(this.long());
    }
    return longs;
  };

  this[nbt.tagTypes.string] = function() {
    var length = this.short();
    var slice = sliceUint8Array(arrayView, this.offset,
      this.offset + length);
    this.offset += length;
    return decodeUTF8(slice);
  };
  this[nbt.tagTypes.list] = function() {
    var type = this.byte();
    var length = this.int();
    var values = [];
    var i;
    for (i = 0; i < length; i++) {
      values.push(this[type]());
    }
    return {
      type: nbt.tagTypeNames[type],
      value: values
    };
  };

  this[nbt.tagTypes.compound] = function() {
    var values = {};
    while (true) {
      var type = this.byte();
      if (type === nbt.tagTypes.end) {
        break;
      }
      var name = this.string();
      var value = this[type]();
      values[name] = {
        type: nbt.tagTypeNames[type],
        value: value
      };
    }
    return values;
  };

  var typeName;
  for (typeName in nbt.tagTypes) {
    if (nbt.tagTypes.hasOwnProperty(typeName)) {
      this[typeName] = this[nbt.tagTypes[typeName]];
    }
  }
}
nbt.tagTypes = {
  'end': 0,
  'byte': 1,
  'short': 2,
  'int': 3,
  'long': 4,
  'float': 5,
  'double': 6,
  'byteArray': 7,
  'string': 8,
  'list': 9,
  'compound': 10,
  'intArray': 11,
  'longArray': 12
};

nbt.tagTypeNames = {};
(function() {
  for (var typeName in nbt.tagTypes) {
    if (nbt.tagTypes.hasOwnProperty(typeName)) {
      nbt.tagTypeNames[nbt.tagTypes[typeName]] = typeName;
    }
  }
})();

function encodeUTF8(str) {
  var array = [], i, c;
  for (i = 0; i < str.length; i++) {
    c = str.charCodeAt(i);
    if (c < 0x80) {
      array.push(c);
    } else if (c < 0x800) {
      array.push(0xC0 | c >> 6);
      array.push(0x80 | c         & 0x3F);
    } else if (c < 0x10000) {
      array.push(0xE0 |  c >> 12);
      array.push(0x80 | (c >>  6) & 0x3F);
      array.push(0x80 |  c        & 0x3F);
    } else {
      array.push(0xF0 | (c >> 18) & 0x07);
      array.push(0x80 | (c >> 12) & 0x3F);
      array.push(0x80 | (c >>  6) & 0x3F);
      array.push(0x80 |  c        & 0x3F);
    }
  }
  return array;
}

function decodeUTF8(array) {
  var codepoints = [],
  i;
  for (i = 0; i < array.length; i++) {
    if ((array[i] & 0x80) === 0) {
      codepoints.push(array[i] & 0x7F);
    } else if (i+1 < array.length &&
      (array[i]   & 0xE0) === 0xC0 &&
      (array[i+1] & 0xC0) === 0x80) {
      codepoints.push(
        ((array[i]   & 0x1F) << 6) |
        (array[i+1] & 0x3F));
    } else if (i+2 < array.length &&
      (array[i]   & 0xF0) === 0xE0 &&
      (array[i+1] & 0xC0) === 0x80 &&
      (array[i+2] & 0xC0) === 0x80) {
      codepoints.push(
        ((array[i]   & 0x0F) << 12) |
        ((array[i+1] & 0x3F) <<  6) |
        (array[i+2] & 0x3F));
    } else if (i+3 < array.length &&
      (array[i]   & 0xF8) === 0xF0 &&
      (array[i+1] & 0xC0) === 0x80 &&
      (array[i+2] & 0xC0) === 0x80 &&
      (array[i+3] & 0xC0) === 0x80) {
      codepoints.push(
        ((array[i]   & 0x07) << 18) |
        ((array[i+1] & 0x3F) << 12) |
        ((array[i+2] & 0x3F) <<  6) |
        (array[i+3] & 0x3F));
    }
  }
  return String.fromCharCode.apply(null, codepoints);
}

function sliceUint8Array(array, begin, end) {
  if ('slice' in array) {
    return array.slice(begin, end);
  } else {
    return new Uint8Array([].slice.call(array, begin, end));
  }
}