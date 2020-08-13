import _ from 'underscore';

/**
 * IOS doesn't support Promise.allSettled, but all modern browsers do so a reference directly to the native
 * Promise implementation is fine.
 */
const promiseAllSettled = arrayOfPromises => Promise.allSettled(arrayOfPromises);


export default promiseAllSettled;
