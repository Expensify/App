import styles from '../../../../styles/styles';

const pickerStyles = disabled => ({
    ...styles.picker(disabled),
    inputIOS: styles.picker(disabled).inputNative,
});

export default pickerStyles;
