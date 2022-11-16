import CONST from '../../../../CONST';
import * as Browser from '../../../../libs/Browser';
import styles from '../../../../styles/styles';

const pickerStylesWeb = () => {
    if (CONST.BROWSER.FIREFOX === Browser.getBrowser()) {
        return {
            textIndent: -2,
        };
    }
    return {};
};

const pickerStyles = disabled => ({
    ...styles.picker(disabled),
    inputWeb: {
        ...styles.picker(disabled).inputWeb,
        ...pickerStylesWeb(),
    },
});

export default pickerStyles;
