var assert = require("assert");
var tmpl = require("../src/tmpl");

/* global foo */

describe("tmpl", function () {

  it("transclude 无参数", function () {
    var fooText = `
{{#foo}}
{{-bar}}
foo
{{-}}
{{#}}
`;

    var barText  = `
{{#bar(children)}}
{{=children}}bar
{{#}}
`;
    eval(tmpl(fooText));
    eval(tmpl(barText));
    assert.equal(foo(), 'foobar');
  });

  it("transclude 空参数, 各种异常", function () {
    var fooText = `
{{#foo}}
{{- bar (   )}}
foo
{{- }}
{{#}}
`;

    var barText  = `
{{#bar(children)}}
{{=children}}bar
{{#}}
`;
    eval(tmpl(fooText));
    eval(tmpl(barText));
    assert.equal(foo(), 'foobar');
  });

  it("transclude 带参数", function () {
    var fooText = `
{{#foo(a ,   b)}}
{{-bar}}
{{=a}}
{{=b}}
{{-}}
{{#}}
`;

    var barText  = `
{{#bar(children)}}
{{=children}}bar
{{#}}
`;
    eval(tmpl(fooText));
    eval(tmpl(barText));
    assert.equal(foo('foo', 'foo'), 'foofoobar');
  });

  it("transclude 插入多段", function () {
    var fooText = `
{{#foo}}
{{-bar}}
foo
{{--}}
foo
{{-}}
{{#}}
`;

    var barText  = `
{{#bar(children, children2)}}
{{=children}}bar{{=children2}}
{{#}}
`;

    eval(tmpl(fooText));
    eval(tmpl(barText));
    assert.equal(foo(), 'foobarfoo');
  });

});
