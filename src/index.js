"use strict";

// inspired by: eslint-plugin-html

var path = require("path");
var extractGlobals = require("./extract");
var tmpl = require("./tmpl");

var needle = path.join("lib", "eslint.js");
var eslint;
for (var key in require.cache) {
  if (key.indexOf(needle, key.length - needle.length) >= 0) {
    eslint = require(key);
    if (typeof eslint.verify === "function") {
      break;
    }
  }
}

if (!eslint) {
  throw new Error("eslint-plugin-viper error: It seems that eslint is not loaded. ");
}

function createProcessor() {
  var verify = eslint.verify;

  function patch() {
    eslint.verify = function (textOrSourceCode, config, filenameOrOptions, saveState) {
      // 加入include全局变量
      config.globals['include'] = true;
      // 提取/* exported|public */扩展global字段
      extractGlobals(filenameOrOptions.filename).forEach(function(name) {
          config.globals[name] = true;
      });
      // tmpl转化模板
      return verify.call(this, tmpl(textOrSourceCode), config, filenameOrOptions, saveState);
    };
  }

  function unpatch() {
    eslint.verify = verify;
  }
  return {

    preprocess: function (content) {
      patch();
      return [content];
    },

    postprocess: function (messages) {
      unpatch();
      return messages[0];
    },

  };

}

var processors = {};
processors['.js'] = createProcessor(false);
processors['.vp'] = createProcessor(false);

exports.processors = processors;

//--- 测试内容 ----------------------------------------------
if (process.argv[2] !== '__test__') {
    return;
}

console.log('====== extractGlobals ======');
console.assert(extractGlobals('foo/all.js')[1] == 'Dom__setHtml');
console.assert(extractGlobals('foo/index.js')[1] == 'Dom__setHtml');


console.log('====== recurseUpFindFile ======');
console.assert(
    file.recurseUpFindFile('all.js', 'foo') ==
    file.abspath('foo/all.js', __dirname),
    '当前目录'
);
console.assert(
    file.recurseUpFindFile('.vimrc', __dirname) ==
    file.abspath('.vimrc', process.env['HOME']),
    '递归查找'
);

console.log('====== findKeyword ======');
var ALL_FILE = `
include([
'./index.js'
]);

/* public Dom__setHtml */
/* exported Dom__setHtml */
`;
console.assert(findKeyword(ALL_FILE, 'public')[0] == 'Dom__setHtml');
console.assert(findKeyword(ALL_FILE, 'exported')[0] == 'Dom__setHtml');

console.log('====== parseIncluded ======');
console.assert(parseIncluded(ALL_FILE)[0] == './index.js');
