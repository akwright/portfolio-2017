module.exports = {
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "env": {
    "es6": true,
    "node": true,
    "browser": true
  },
  "extends": "eslint:recommended",
  "rules": {
    // enable additional rules
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],

    // override default options for rules from base config
    "no-cond-assign": ["error", "always"],

    // disable rules from base config
    "no-console": "off",
  }
}