// eslint-disable-next-line rulesdir/display-name-property
import styles from '../../../styles/styles';

const pickerStyles = isDisabled => ({
    ...styles.picker(isDisabled),
    inputIOS: styles.picker(isDisabled).inputNative,
});

export default pickerStyles;
