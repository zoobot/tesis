// <!-- Created by Duncan on 12.28.2016 -->
// test/index.js
// require all test files using special Webpack feature
// https://webpack.github.io/docs/context.html#require-context
const testsContext = require.context('./client_spec', true, /\_spec$/)
testsContext.keys().forEach(testsContext)