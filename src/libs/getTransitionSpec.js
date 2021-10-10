/**
 * Get transition spec for Stack Navigator screen options.
 * transitionSpec is a configuration object for screen transition.
 * https://reactnavigation.org/docs/stack-navigator/#transitionspec
 *
 * @param {Number} duration in ms
 * @returns {Object}
 */
export default function getTransitionSpec(duration) {
    const timingConfig = {
        animation: 'timing',
        config: {duration},
    };
    return {
        transitionSpec: {
            open: timingConfig,
            close: timingConfig,
        },
    };
}
