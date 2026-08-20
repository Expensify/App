import {useListItemContext} from '@components/SelectionList/ListItemContext';
import TextWithTooltip from '@components/TextWithTooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type ListItemSubtitleProps = {
    /** Subtitle text to display */
    text: string;

    /** Max number of lines before truncating */
    numberOfLines?: number;

    /** FullStory class forwarded to the underlying text */
    forwardedFSClass?: ForwardedFSClassProps['forwardedFSClass'];

    /** Additional styles merged onto the subtitle */
    style?: StyleProp<TextStyle>;
};

function ListItemSubtitle({text, numberOfLines, forwardedFSClass, style}: ListItemSubtitleProps) {
    const styles = useThemeStyles();
    const {shouldShowTooltip} = useListItemContext();

    return (
        <TextWithTooltip
            shouldShowTooltip={!!shouldShowTooltip}
            text={text}
            numberOfLines={numberOfLines}
            style={[styles.textLabelSupporting, styles.lh16, styles.pre, style]}
            forwardedFSClass={forwardedFSClass}
        />
    );
}

export default ListItemSubtitle;
