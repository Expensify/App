import styles from '../../../styles/styles';

const pickerStyles = (disabled, error, focused) => ({
    ...styles.Picker(disabled, error, focused),
    inputAndroid: {
        ...styles.Picker(disabled, error, focused).inputNative,
        paddingLeft: 12,
    },
});

export default pickerStyles;
