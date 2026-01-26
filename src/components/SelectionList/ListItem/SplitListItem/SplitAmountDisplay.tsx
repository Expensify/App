import React, {useState} from 'react';
import {View} from 'react-native';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import CONST from '@src/CONST';

type SplitAmountDisplayProps = {
    /** The split item data containing amount, currency, and editable state. */
    splitItem: SplitListItemType;
    /** The width of the content area. */
    contentWidth?: number | string;
    /** Whether to remove default spacing from the container. */
    shouldRemoveSpacing?: boolean;
};

function SplitAmountDisplay({splitItem, contentWidth = '100%', shouldRemoveSpacing = false}: SplitAmountDisplayProps) {
    const styles = useThemeStyles();
    const [prefixCharacterMargin, setPrefixCharacterMargin] = useState<number>(CONST.CHARACTER_WIDTH);

    return (
        <View style={[styles.cannotBeEditedSplitInputContainer, shouldRemoveSpacing && [styles.removeSpacing]]}>
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
