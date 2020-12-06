# react-in-typescript
Rewrite React and ReactDOM in Typescript.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Extra Setup
* Uninstall `react-dom` because I will use my own implementation. I tried to uninstall `react`, but I added it back because I decided to use react types for API requirements.  For example, I simply reuse the types of `React.ReactElement`, `React.ReactNode`, `React.JSX.IntrinsicElements`, rather than define my own versions. This allows me to focus on the core implementation and also guarantees that my code is compatible with `react`.
* In this project, we need to transform JSX into JS and replace the default `React.createElement` with `MyReact.createElement`. Here I use [babel-plugin-transform-react-jsx](https://www.npmjs.com/package/babel-plugin-transform-react-jsx). To customize babel beyond the default config of `create-react-app`, I found a [workaround here](https://github.com/facebook/create-react-app/issues/167).
  * First `yarn eject`.
  * Then edit `config/webpack.config.js` by adding the plugin into the the following section (around line 390).
```js
{
    test: /\.(js|mjs|jsx|ts|tsx)$/,
    include: paths.appSrc,
    loader: require.resolve('babel-loader'),
    options: {
    customize: require.resolve(
        'babel-preset-react-app/webpack-overrides'
    ),

    plugins: [
        [
        require.resolve('babel-plugin-named-asset-import'),
        {
            loaderMap: {
            svg: {
                ReactComponent:
                '@svgr/webpack?-svgo,+titleProp,+ref![path]',
            },
            },
        },
        ],
        [ // Add plugin here
        "transform-react-jsx",
        {
            "pragma": "MyReact.createElement" // default pragma is React.createElement
        }
        ],
        isEnvDevelopment &&
        shouldUseReactRefresh &&
        require.resolve('react-refresh/babel'),
    ].filter(Boolean),
```
* Similarly, in the testing, we also need to transform JSX with JS and use `MyReact.createElement`. Since this project is using `jest` with `babel-jest`, I was inspired by [this issue](https://github.com/facebook/jest/issues/6368), and created my own transformer for `babel-jest`. The code is put under `config/jest/jsxTransform.js`. Then, inside `package.json`, replace the `babel-jest` transform as below:
    ```json
    "jest": {
        ...
        "transform": {
            // "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
            "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/config/jest/jsxTransform.js",
            ...
        }
        ...
    }
    ```

* The webpage does not reload on file change in Windows Linux. I checked this [StackOverflow](https://stackoverflow.com/questions/42189575/create-react-app-reload-not-working) and this Reddit [Create React App live reload not working on Ubuntu-18.04](https://www.reddit.com/r/bashonubuntuonwindows/comments/fz0du4/create_react_app_live_reload_not_working_on/), none was working. Then I updated the `injectClient` from false to true in `config/webpackDevServer.config.js`. Now auto-reload is working. When I checked the compiled code, I noticed that `0.chunk.js` has added about 6000 lines of code of `WebsocketClient.js`, compared to the old version when the `injectClient` is false.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
