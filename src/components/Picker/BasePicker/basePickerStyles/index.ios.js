import styles from '../../../../styles/styles';

const pickerStyles = (disabled, error, focused) => ({
    ...styles.picker(disabled, error, focused),
    inputIOS: styles.picker(disabled, error, focused).inputNative,
});

export default pickerStyles;
