// eslint-disable-next-line rulesdir/display-name-property
import styles from '../../../styles/styles';

const pickerStyles = isDisabled => ({
    ...styles.picker(isDisabled),
    inputAndroid: {
        ...styles.picker(isDisabled).inputNative,
        paddingLeft: 12,
    },
});

export default pickerStyles;
