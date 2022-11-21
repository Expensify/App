// eslint-disable-next-line rulesdir/display-name-property
import CONST from '../../../CONST';
import * as Browser from '../../../libs/Browser';
import styles from '../../../styles/styles';

const pickerStylesWeb = () => {
    if (CONST.BROWSER.FIREFOX === Browser.getBrowser()) {
        return {
            textIndent: -2,
        };
    }
    return {};
};

const pickerStyles = isDisabled => ({
    ...styles.picker(isDisabled),
    inputWeb: {
        ...styles.picker(isDisabled).inputWeb,
        ...pickerStylesWeb(),
    },
});

export default pickerStyles;
