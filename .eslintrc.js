module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "consistent-return": 0,
        "no-shadow": 0,
        "no-console": 0,
        "no-unused-vars": 0,
        "func-names": 0,
        "linebreak-style": 0,
        "prefer-destructuring": ["error", {
            "VariableDeclarator": {
              "array": false,
              "object": false
            }
        }],
    },
};