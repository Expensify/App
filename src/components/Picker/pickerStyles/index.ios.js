import styles from '../../../styles/styles';

const pickerStyles = disabled => ({
    ...styles.expensiPicker(disabled),
    inputIOS: styles.expensiPicker(disabled).inputNative,
});

export default pickerStyles;
