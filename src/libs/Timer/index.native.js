// /**
//  * We don't want the clock skew listener to run on native as it only helps us on desktop/web when a laptop is closed
//  * and reopened. This method of detecting timing variance to see if we are inactive doesn't work well on native mobile
//  * platforms. These platforms should use AppState instead to determine whether they must catch up on missing data.
//  */
// export default {
//     addClockSkewListener: () => () => {},
// };


/**
 * The Timer module is used on web/desktop to detect when a computer has gone to sleep. We don't use this on native
 * mobile since it does not work reliably and fires at inappropriate times.
 */
 let sleepTimer;
 let lastTime;

 /**
  *
  * @param {Function} onClockSkewCallback function to call when the
  * @returns {Fuction} that when called clears the timer
  */
 function addClockSkewListener(onClockSkewCallback) {
     clearInterval(sleepTimer);
     sleepTimer = setInterval(() => {
         const currentTime = (new Date()).getTime();
         const isSkewed = currentTime > (lastTime + 8000);
         lastTime = currentTime;

         if (!isSkewed) {
             return;
         }

         onClockSkewCallback();
     }, 2000);

     return () => {
         clearInterval(sleepTimer);
         sleepTimer = null;
     };
 }

 export default {
     addClockSkewListener,
 };
