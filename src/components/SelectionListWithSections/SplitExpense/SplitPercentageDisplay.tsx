import React from 'react';
import {View} from 'react-native';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SplitPercentageDisplayProps = {
    /**
     * Split list item associated with this row, containing the amount, currency and symbol to display.
     */
    splitItem: SplitListItemType;
    /**
     * Width of the editable amount input content area in pixels.
     */
    contentWidth: number;
};

function SplitPercentageDisplay({splitItem, contentWidth}: SplitPercentageDisplayProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.cannotBeEditedSplitInputContainer, styles.ph0]}>
            <Text
                style={[styles.getSplitListItemAmountStyle(CONST.CHARACTER_WIDTH, contentWidth), styles.textAlignLeft]}
                numberOfLines={1}
            >
                {splitItem.percentage}%
            </Text>
        </View>
    );
}

SplitPercentageDisplay.displayName = 'SplitPercentageDisplay';

export default SplitPercentageDisplay;
