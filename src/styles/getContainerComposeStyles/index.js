import styles from '../styles';
// we need to set paddingVertical = 0 on the web to avoid App displays normal pointer on some parts of compose box when not in focus
export default () => [styles.textInputComposeSpacing, styles.textInputComposeBorder, {paddingVertical: 0}];
