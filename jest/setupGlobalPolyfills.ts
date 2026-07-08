import {TextDecoder, TextEncoder} from 'util';

// jsdom (the default Jest test environment) doesn't provide TextEncoder/TextDecoder globally, but some src/
// code (e.g. src/libs/StringUtils) relies on them being globally available, so polyfill them here before any
// test file runs.
Object.assign(global, {TextDecoder, TextEncoder});
