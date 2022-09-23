/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
// start the usual app
import '../../../index';
import * as E2E from './index';

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

E2E.setup();

// TODO: given that this file is that short, it raises the question, whether we can't move that to the main index file?
// Given that we do it that way, we prevent any E2E code to be bundled in the real release app!
