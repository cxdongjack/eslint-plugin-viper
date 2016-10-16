var assert = require("assert");
var path = require("path");
var obj = require("../src/extract");
console.log(obj.findAll);

describe("plugin", function () {

  it("findAll index.js", function () {
    var allJs = obj.findAll(path.join(__dirname, "fixtures", "foo/index.js"));
    assert.equal(/foo\/all\.js$/.test(allJs), true);
  });

  it("findAll", function () {
    var allJs = obj.findAll(path.join(__dirname, "fixtures", "foo/all.js"));
    assert.equal(/foo\/all\.js$/.test(allJs), true);
  });

  it("parseIncluded", function () {
    var list = obj.parseIncluded('var a = 1;\ninclude(["a.js", "b.js"]);\nvar b=2;');
    assert.equal(list[1], 'b.js');
  });
});
