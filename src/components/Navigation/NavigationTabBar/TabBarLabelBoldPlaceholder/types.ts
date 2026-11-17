import type {StyleProp, TextStyle} from 'react-native';

type TabBarLabelBoldPlaceholderProps = {
    /** Tab label whose bold width is reserved. On web it goes in a data attribute instead of the text, so it stays out of the link text */
    label: string;

    /** Number of lines the visible label is limited to */
    numberOfLines: number;

    /** Style of the visible label in bold, so the placeholder takes the same width */
    style: StyleProp<TextStyle>;
};

export default TabBarLabelBoldPlaceholderProps;
