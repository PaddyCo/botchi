module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "plugins": [
      "babel"
    ],
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "no-console": 0,
        "indent": [
            "error",
            2
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
