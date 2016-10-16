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
    // var all = file.recurseUpFindFile('all.js', dirname);
    var all = findAll(target);
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

function findAll(target) {
    // 如果自身包含返回自身
    if (file.read(target).indexOf('include([') !== -1) {
        return target;
    }
    // 否则查找递归向上查找all.js
    var dirname = path.dirname(target);
    var all = file.recurseUpFindFile('all.js', dirname);
    return all;
}

module.exports = extractGlobals;
module.exports.findAll = findAll;
module.exports.parseIncluded = parseIncluded;
