import {useListItemContext} from '@components/SelectionList/ListItemContext';
import TextWithTooltip from '@components/TextWithTooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type ListItemTitleProps = {
    /** Title text to display */
    text: string;

    /** Max number of lines before truncating */
    numberOfLines?: number;

    /** Additional styles merged onto the title (overrides the bold, single-line defaults) */
    style?: StyleProp<TextStyle>;
};

function ListItemTitle({text, numberOfLines, style}: ListItemTitleProps) {
    const styles = useThemeStyles();
    const {shouldShowTooltip} = useListItemContext();

    return (
        <TextWithTooltip
            shouldShowTooltip={!!shouldShowTooltip}
            text={text}
            numberOfLines={numberOfLines}
            style={[styles.optionDisplayName, styles.sidebarLinkText, styles.sidebarLinkTextBold, styles.pre, style]}
        />
    );
}

export default ListItemTitle;
