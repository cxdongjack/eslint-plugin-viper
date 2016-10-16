var fs = require('fs');
var path = require('path');
var file = {};
var target = process.argv[process.argv.length - 1];

file.isroot = function(str) {
    return str.charAt(0) === '/';
};

file.exists = function(filepath) {
    return fs.existsSync(filepath);
};

file.abspath = function(str, base) {
    if (!file.isroot(str)) {
        return path.resolve(path.join(base || process.cwd(), path.normalize(str)));
    }
    return str;
};

file.contain = function(base, filepath) {
  return path.relative(base, filepath).charAt(0) !== '.';
};

file.read = function(filepath) {
  return fs.readFileSync(filepath, 'utf8');
};

file.recurseUpFindFile = function(name, dirname) {
    var path;
    if (dirname == '/') {
        return;
    }
    path = file.abspath(name, dirname)
    if (file.exists(path)) {
        return path;
    }
    return file.recurseUpFindFile(name, file.abspath('..', dirname));
}

// 提取 /* public Dom__setHtml */
function findKeyword(str, key) {
    var reg = '/\\* ' + key + ' (.*?) \\*/';
    var names = str.match(new RegExp(reg, 'g'));
    if (!names) {
        return [];
    }
    return names.map(function(name) {
        return name.match(new RegExp(reg))[1];
    });
}

// 解析include([...])
function parseIncluded(cnt) {
    var include = function(list) {
        return list;
    };
    if (cnt.indexOf('include([') === -1) {
        return;
    }
    return eval(cnt);
}

// 根据当前文件提取出所有全局函数
// 包括当前模块下的/* exports */
// 包括引用模块下的/* public */
function extractGlobals(target) {
    // 找到当前模块的all.js
    var dirname = path.dirname(target);
    var all = file.recurseUpFindFile('all.js', dirname);
    var files = parseIncluded(file.read(all));
    // 提取模块内的exports
    var exports = files.filter(function(item) {
        return file.contain(dirname, file.abspath(item, dirname));
    }).reduce(function(mem, item) {
        return mem.concat(findKeyword(file.read(file.abspath(item, dirname)), 'exported'));
    }, []);
    // 提取引用模块的public
    var globals = files.filter(function(item) {
        return !file.contain(dirname, file.abspath(item, dirname));
    }).reduce(function(mem, item) {
        return mem.concat(findKeyword(file.read(file.abspath(item, dirname)), 'public'));
    }, []);
    return exports.concat(globals);
}

//--- main ----------------------------------------------

var config = {
    "env": {
        "browser": true,
    },
    "plugins": ["html"],
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "space-before-blocks": "error"
    }
};

//if (target && file.recurseUpFindFile('all.js', path.dirname(target))) {
    //config.globals = {
        //"include": true
    //};
    //extractGlobals(target).forEach(function(name) {
        //config.globals[name] = true;
    //});
//}

module.exports = config;

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
