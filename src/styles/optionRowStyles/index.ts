import {Styles} from '@styles/styles';
import CompactContentContainerStyles from './types';

export default function getCompactContentContainerStyles(styles: Styles): CompactContentContainerStyles {
    return styles.alignItemsBaseline as CompactContentContainerStyles;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getCompactContentContainerStyles,
};
