import React, {useState} from 'react';
import {View} from 'react-native';
import type {SplitListItemType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import spacing from '@styles/utils/spacing';
import CONST from '@src/CONST';

type SplitAmountDisplayProps = {
    splitItem: SplitListItemType;
    contentWidth: number;
    shouldRemoveSpacing?: boolean;
};

function SplitAmountDisplay({splitItem, contentWidth, shouldRemoveSpacing = false}: SplitAmountDisplayProps) {
    const styles = useThemeStyles();
    const [prefixCharacterMargin, setPrefixCharacterMargin] = useState<number>(CONST.CHARACTER_WIDTH);

    return (
        <View style={[styles.cannotBeEditedSplitInputContainer, shouldRemoveSpacing && [spacing.ph0, spacing.mv0]]}>
            <Text
                style={[styles.optionRowAmountInput, styles.pAbsolute]}
                onLayout={(event) => {
                    if (event.nativeEvent.layout.width === 0 && event.nativeEvent.layout.height === 0) {
                        return;
                    }
                    setPrefixCharacterMargin(event.nativeEvent.layout.width);
                }}
            >
                {splitItem.currencySymbol}
            </Text>
            <Text
                style={[styles.getSplitListItemAmountStyle(prefixCharacterMargin, contentWidth), styles.textAlignLeft]}
                numberOfLines={1}
            >
                {convertToDisplayStringWithoutCurrency(splitItem.amount, splitItem.currency)}
            </Text>
        </View>
    );
}

export default SplitAmountDisplay;
