/**
 * ESM entry for ESLint and other ESM consumers.
 * Implementation lives in checkWithOxc.js (CJS) for Jest compatibility.
 */
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {checkReactCompilerWithOxc, didReactCompilerCompileFile} = require('./checkWithOxc.js');

export {checkReactCompilerWithOxc, didReactCompilerCompileFile};
