import {TextDecoder, TextEncoder} from 'util';

// Must run as its own setupFiles entry, before jest/setup.ts. That file imports @actions/core (needed to
// mock Onyx's CI logging, see jest/setup.ts), whose @actions/http-client dependency reads the global
// TextEncoder at import time. ES imports are hoisted above all other statements within a single file, so
// setting this polyfill anywhere in jest/setup.ts itself would still run too late.
Object.assign(global, {TextDecoder, TextEncoder});
