# react-in-typescript
Simple React in Typescript

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Setup
* Uninstall `react` and `react-dom` because we will use our own implementation.
* Install react types via `yarn add -D @types/react` if not existing. We will use react types for API requirement.
* In this project, we need to transform JSX into JS and replace it with `MyReact.createElement`, rather than the default `React.createElement`. [babel-plugin-transform-react-jsx](https://www.npmjs.com/package/babel-plugin-transform-react-jsx) can do the work. To customize babel beyond the default config of `create-react-app`, I found a [workaround here](https://github.com/facebook/create-react-app/issues/167). First `yarn eject`, then edit `config/webpack.config.js` by adding the plugin into the the following section (around line 390).
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
        [
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

* The webpage does not reload on file change in Windows Linux. https://stackoverflow.com/questions/42189575/create-react-app-reload-not-working

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
