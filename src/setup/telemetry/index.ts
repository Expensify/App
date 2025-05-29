import CONST from '@src/CONST';
import Timing from '@userActions/Timing';

export default function () {
  Timing.start(CONST.TIMING.SPLASH_SCREEN);
  Timing.start(CONST.TIMING.OPEN_APP);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      return;
    }

    Timing.clearData();
  });
}
