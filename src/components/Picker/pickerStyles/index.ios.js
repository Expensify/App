import styles from '../../../styles/styles';

const pickerStyles = (disabled, error, focused) => ({
    ...styles.Picker(disabled, error, focused),
    inputIOS: styles.Picker(disabled, error, focused).inputNative,
});

export default pickerStyles;
