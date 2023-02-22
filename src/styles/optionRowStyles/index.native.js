import styles from '../styles';

/**
 *  On native platforms, alignItemsBaseline does not work correctly
 *  in lining the items together. As such, on native platform, we're
 *  removing the line height of the elements in line. This causes
 *  the elements to be displayed in line correctly.
 *  https://github.com/Expensify/App/issues/14148
*/

const compactAlternateTextStyle = {};

const compactContentContainerStyles = styles.alignItemsCenter;

export {
    compactAlternateTextStyle,
    compactContentContainerStyles,
};
