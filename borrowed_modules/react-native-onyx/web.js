/**
 * @file
 * Web entry point for Onyx
 * This file is resolved by non react-native projects
 * Like React for web or pure JS
 */

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/web.min');
} else {
    module.exports = require('./dist/web.development');
}
