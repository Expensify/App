import {Styles} from '@styles/styles';
import CompactContentContainerStyles from './types';

/**
 *  On native platforms, alignItemsBaseline does not work correctly
 *  in lining the items together. As such, on native platform, we're
 *  keeping compactContentContainerStyles as it is.
 *  https://github.com/Expensify/App/issues/14148
 */
export default function getCompactContentContainerStyles(styles: Styles): CompactContentContainerStyles {
    return styles.alignItemsCenter as CompactContentContainerStyles;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getCompactContentContainerStyles,
};
