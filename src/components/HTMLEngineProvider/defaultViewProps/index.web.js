import styles from '../../../styles/styles';

export default {
    // For web platform default to block display. Using flex on root view will force all
    // child elements to be block elements even when they have display inline added to them.
    // This will affect elements like <a> which are inline by default.
    style: [styles.dBlock, styles.userSelectText],
};
