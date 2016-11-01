// http://eslint.cn/docs/rules/comma-spacing
module.exports = {
    "env": {
        "browser": true,
        "jasmine": true
    },
    "plugins": ["viper"],
    "extends": "eslint:recommended",
    "rules": {
        "no-console": [
            "error", {
                allow: [ "error" ]
            }
        ],
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
        "space-before-blocks": "error",
        "comma-spacing": "error"
    }
};
