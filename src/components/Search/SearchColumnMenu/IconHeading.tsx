import type {SortableHeaderLabelProps} from '@components/Search/SortableHeaderText';
import {SortableHeaderLabel} from '@components/Search/SortableHeaderText';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import HeadingCaret from './HeadingCaret';

type IconHeadingProps = {
    isCaretVisible: boolean;
    labelProps: SortableHeaderLabelProps;
};

/** An icon-only heading. It has no room for a caret beside its icon, so the caret takes the icon's place. */
function IconHeading({isCaretVisible, labelProps}: IconHeadingProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View style={[styles.flexRow, styles.justifyContentCenter]}>
            {isCaretVisible ? (
                <View style={[StyleUtils.getWidthAndHeightStyle(variables.iconSizeSmall), styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <HeadingCaret />
                </View>
            ) : (
                <SortableHeaderLabel {...labelProps} />
            )}
        </View>
    );
}

export default IconHeading;
