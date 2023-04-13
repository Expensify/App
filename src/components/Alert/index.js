import _ from 'underscore';

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
