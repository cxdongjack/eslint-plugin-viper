"use strict"

// inspired by: eslint-plugin-html

const path = require("path")
const semver = require("semver")
var tmpl = require("./tmpl");

const BOM = "\uFEFF"

// Disclaimer:
//
// This is not a long term viable solution. ESLint needs to improve its processor API to
// provide access to the configuration before actually preprocess files, but it's not
// planed yet. This solution is quite ugly but shouldn't alter eslint process.
//
// Related github issues:
// https://github.com/eslint/eslint/issues/3422
// https://github.com/eslint/eslint/issues/4153

const needleV3 = path.join("lib", "eslint.js")
const needleV4 = path.join("lib", "linter.js")

iterateESLintModules(patch)

function getModulesFromRequire() {
  const version = require("eslint/package.json").version

  const eslint = semver.satisfies(version, ">= 4")
    ? require("eslint/lib/linter").prototype
    : require("eslint/lib/eslint")

  return {
    version,
    eslint,
    SourceCodeFixer: require("eslint/lib/util/source-code-fixer"),
  }
}

function getModulesFromCache(key) {
  if (!key.endsWith(needleV3) && !key.endsWith(needleV4)) return

  const module = require.cache[key]
  if (!module || !module.exports) return

  const version = require(path.join(key, "..", "..", "package.json")).version

  const SourceCodeFixer =
    require.cache[path.join(key, "..", "util", "source-code-fixer.js")]

  if (!SourceCodeFixer || !SourceCodeFixer.exports) return

  const eslint = semver.satisfies(version, ">= 4")
    ? module.exports.prototype
    : module.exports
  if (typeof eslint.verify !== "function") return

  return {
    version,
    eslint,
    SourceCodeFixer: SourceCodeFixer.exports,
  }
}

function iterateESLintModules(fn) {
  if (!require.cache || Object.keys(require.cache).length === 0) {
    // Jest is replacing the node "require" function, and "require.cache" isn't available here.
    fn(getModulesFromRequire())
    return
  }

  let found = false

  for (const key in require.cache) {
    const modules = getModulesFromCache(key)
    if (modules) {
      fn(modules)
      found = true
    }
  }

  if (!found) {
    throw new Error(
      `
      eslint-plugin-html error: It seems that eslint is not loaded.
      If you think it is a bug, please file a report at
      https://github.com/BenoitZugmeyer/eslint-plugin-html/issues
    `
    )
  }
}

function patch(modules) {
  const eslint = modules.eslint
  const SourceCodeFixer = modules.SourceCodeFixer

  const sourceCodeForMessages = new WeakMap()

  const verify = eslint.verify
  eslint.verify = function(
    textOrSourceCode,
    config,
    filenameOrOptions,
    saveState
  ) {
    return verify.call(this, tmpl(textOrSourceCode), config, filenameOrOptions, saveState);
  }

  const applyFixes = SourceCodeFixer.applyFixes
  SourceCodeFixer.applyFixes = function(sourceCode, messages) {
    const originalSourceCode = sourceCodeForMessages.get(messages)
    if (originalSourceCode) {
      const hasBOM = originalSourceCode.startsWith(BOM)
      sourceCode = semver.satisfies(modules.version, ">= 4.6.0")
        ? originalSourceCode
        : {
          text: hasBOM ? originalSourceCode.slice(1) : originalSourceCode,
          hasBOM,
        }
    }
    return applyFixes.call(this, sourceCode, messages)
  }
}

