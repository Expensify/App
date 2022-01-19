import styles from '../../../../styles/styles';

const pickerStyles = (disabled, error, focused) => ({
    ...styles.picker(disabled, error, focused),
    inputAndroid: {
        ...styles.picker(disabled, error, focused).inputNative,
        paddingLeft: 12,
    },
});

export default pickerStyles;
