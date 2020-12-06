module.exports = require('babel-jest').createTransformer({
    "env":
    {
        "test": {
            "plugins": [
                ["transform-react-jsx",
                    {
                        "pragma": "MyReact.createElement" // default pragma is React.createElement
                    }
                ]
            ]
        }

    }
});
