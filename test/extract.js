var assert = require("assert");
var path = require("path");
var obj = require("../src/extract");

describe("plugin", function () {

  it("findInclude index.js", function () {
    var allJs = obj.findInclude(path.join(__dirname, "fixtures", "foo/index.js"));
    assert.equal(/foo\/all\.js$/.test(allJs), true);
  });

  it("findInclude", function () {
    var allJs = obj.findInclude(path.join(__dirname, "fixtures", "foo/all.js"));
    assert.equal(/foo\/all\.js$/.test(allJs), true);
  });

  it("parseIncluded", function () {
    var list = obj.parseIncluded('var a = 1;\ninclude(["a.js", "b.js"]);\nvar b=2;');
    assert.equal(list[1], 'b.js');
  });
});
