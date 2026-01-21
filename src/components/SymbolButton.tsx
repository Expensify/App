import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
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
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
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
                    src={icons.DownArrow}
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

export default SymbolButton;
