import CONST from '../../../CONST';
import getBrowser from '../../../libs/getBrowser';
import styles from '../../../styles/styles';

const pickerStylesWeb = () => {
    if (CONST.BROWSER.FIREFOX === getBrowser()) {
        return {
            textIndent: -2,
        };
    }
    return {};
};

const pickerStyles = disabled => ({
    ...styles.expensiPicker(disabled),
    inputWeb: {
        ...styles.expensiPicker(disabled).inputWeb,
        ...pickerStylesWeb(),
    },
});

export default pickerStyles;
