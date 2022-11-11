import styles from '../../../../styles/styles';

const pickerStyles = disabled => ({
    ...styles.picker(disabled),
    inputAndroid: {
        ...styles.picker(disabled).inputNative,
        paddingLeft: 12,
    },
});

export default pickerStyles;
