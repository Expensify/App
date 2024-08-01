import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';
import Tooltip from './Tooltip';

type CurrencySymbolButtonProps = {
    /** Currency symbol of selected currency */
    currencySymbol: string;

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: () => void;

    /** Whether the currency button is pressable or not */
    isCurrencyPressable?: boolean;
};

function CurrencySymbolButton({onCurrencyButtonPress, currencySymbol, isCurrencyPressable = true}: CurrencySymbolButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    return isCurrencyPressable ? (
        <Tooltip text={translate('common.selectCurrency')}>
            <PressableWithoutFeedback
                onPress={onCurrencyButtonPress}
                accessibilityLabel={translate('common.selectCurrency')}
                role={CONST.ROLE.BUTTON}
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
            >
                <Icon
                    small
                    src={Expensicons.DownArrow}
                    fill={theme.icon}
                />
                <Text style={styles.iouAmountText}>{currencySymbol}</Text>
            </PressableWithoutFeedback>
        </Tooltip>
    ) : (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text style={styles.iouAmountText}>{currencySymbol}</Text>
        </View>
    );
}

CurrencySymbolButton.displayName = 'CurrencySymbolButton';

export default CurrencySymbolButton;
