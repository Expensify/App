import type Alert from './types';

/** Shows an alert modal with ok and cancel options. */
const alert: Alert = (title, description, options) => {
    const result = window.confirm([title, description].filter(Boolean).join('\n'));
    if (result) {
        const confirmOption = options?.find(({style}) => style !== 'cancel');
        if (confirmOption?.onPress) {
            confirmOption.onPress();
        }
    } else {
        const cancelOption = options?.find(({style}) => style === 'cancel');
        if (cancelOption?.onPress) {
            cancelOption.onPress();
        }
    }
};

export default alert;
