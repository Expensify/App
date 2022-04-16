import CONST from '../../../../CONST';
import * as Browser from '../../../../libs/Browser/Browser';
import styles from '../../../../styles/styles';

const pickerStylesWeb = () => {
    if (CONST.BROWSER.FIREFOX === Browser.getBrowser()) {
        return {
            textIndent: -2,
        };
    }
    return {};
};

const pickerStyles = (disabled, error, focused) => ({
    ...styles.picker(disabled, error, focused),
    inputWeb: {
        ...styles.picker(disabled, error, focused).inputWeb,
        ...pickerStylesWeb(),
    },
});

export default pickerStyles;
