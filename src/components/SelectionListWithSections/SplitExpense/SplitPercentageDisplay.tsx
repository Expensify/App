import React from 'react';
import {View} from 'react-native';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type SplitPercentageDisplayProps = {
    splitItem: SplitListItemType;
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

export default SplitPercentageDisplay;
