/**
 * We don't want the clock skew listener to run on native as it only helps us on desktop/web when a laptop is closed
 * and reopened. This method of detecting timing variance to see if we are inactive doesn't work well on native mobile
 * platforms. These platforms should use AppState instead to determine whether they must catch up on missing data.
 */
export default {
    addClockSkewListener: () => () => {},
};
