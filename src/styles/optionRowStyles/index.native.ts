import styles from '@styles/styles';
import CompactContentContainerStyles from './types';

/**
 *  On native platforms, alignItemsBaseline does not work correctly
 *  in lining the items together. As such, on native platform, we're
 *  keeping compactContentContainerStyles as it is.
 *  https://github.com/Expensify/App/issues/14148
 */
const compactContentContainerStyles: CompactContentContainerStyles = styles.alignItemsCenter;

export {
    // eslint-disable-next-line import/prefer-default-export
    compactContentContainerStyles,
};
