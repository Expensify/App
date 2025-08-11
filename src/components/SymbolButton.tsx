import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';
import Tooltip from './Tooltip';

type SymbolButtonProps = {
    /** Symbol of the input */
    symbol: string;

    /** Function to call when symbol button is pressed */
    onSymbolButtonPress: () => void;

    /** Whether the symbol button is pressable or not */
    isSymbolPressable?: boolean;

    /** Style for the symbol button */
    textStyle?: StyleProp<TextStyle>;
};

function SymbolButton({onSymbolButtonPress, symbol, isSymbolPressable = true, textStyle}: SymbolButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    return isSymbolPressable ? (
        <Tooltip text={translate('common.selectSymbolOrCurrency')}>
            <PressableWithoutFeedback
                onPress={onSymbolButtonPress}
                accessibilityLabel={translate('common.selectSymbolOrCurrency')}
                role={CONST.ROLE.BUTTON}
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
            >
                <Icon
                    small
                    src={Expensicons.DownArrow}
                    fill={theme.icon}
                />
                <Text style={[styles.iouAmountText, styles.lineHeightUndefined, textStyle]}>{symbol}</Text>
            </PressableWithoutFeedback>
        </Tooltip>
    ) : (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text style={[styles.iouAmountText, styles.lineHeightUndefined, textStyle]}>{symbol}</Text>
        </View>
    );
}

SymbolButton.displayName = 'SymbolButton';

export default SymbolButton;
