import styles from '../styles';
// We need to set paddingVertical = 0 on web to avoid displaying a normal pointer on some parts of compose box when not in focus
export default () => [styles.textInputComposeSpacing, styles.textInputComposeBorder, {paddingVertical: 0}];
