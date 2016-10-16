var assert = require("assert");
var path = require("path");
var CLIEngine = require("eslint").CLIEngine;
var plugin = require("..");

function assertMatch(message, re) {
  if (!re.test(message)) {
    throw new Error(`${JSON.stringify(message)} does not match ${re}`);
  }
}

function execute(file, baseConfig) {
  if (!baseConfig) baseConfig = {};

  var cli = new CLIEngine({
    extensions: ["html"],
    baseConfig: {
      settings: baseConfig.settings,
      rules: Object.assign({
        "no-console": 2,
        "no-undef" : "error"
      }, baseConfig.rules),
    },
    ignore: false,
    useEslintrc: false,
  });
  cli.addPlugin("html", plugin);
  var results = cli.executeOnFiles([path.join(__dirname, "fixtures", file)]).results;
  return results[0] && results[0].messages;
}



describe("plugin", function () {

  it("should extract and remap messages", function () {
    //var messages = execute("simple.html");
    var messages = execute("foo/index.js");
    console.log(messages);

    assert.equal(messages.length, 1);

    //assert.equal(messages[0].message, "Unexpected console statement.");
    //assert.equal(messages[0].line, 8);
    //assert.equal(messages[0].column, 7);
  });

});