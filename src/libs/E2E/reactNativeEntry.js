/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
// start the usual app
import '../../../index';
import * as E2E from './index';

console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');

E2E.setup();
