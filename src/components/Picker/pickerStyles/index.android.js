import styles from '../../../styles/styles';

const pickerStyles = disabled => ({
    ...styles.expensiPicker(disabled),
    inputAndroid: styles.expensiPicker(disabled).inputNative,
});

export default pickerStyles;
