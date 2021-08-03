import styles from '../../../styles/styles';

export default {
    ...styles.picker,
    inputIOS: [styles.picker.inputIOS, styles.textInput, styles.inputDisabled],
};
