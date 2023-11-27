import _ from 'underscore';

/**
 * Shows an alert modal with ok and cancel options.
 *
 * @param {String} title The title of the alert
 * @param {String} description The description of the alert
 * @param {Object[]} [options] An array of objects with `style` and `onPress` properties
 */
export default (title, description, options) => {
    const result = _.filter(window.confirm([title, description], Boolean)).join('\n');

    if (result) {
        const confirmOption = _.find(options, ({style}) => style !== 'cancel');
        if (confirmOption && confirmOption.onPress) {
            confirmOption.onPress();
        }
    } else {
        const cancelOption = _.find(options, ({style}) => style === 'cancel');
        if (cancelOption && cancelOption.onPress) {
            cancelOption.onPress();
        }
    }
};
