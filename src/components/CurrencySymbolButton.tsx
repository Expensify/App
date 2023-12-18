import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';
import Tooltip from './Tooltip';

type CurrencySymbolButtonProps = {
    /** Currency symbol of selected currency */
    currencySymbol: string;

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: () => void;
};

function CurrencySymbolButton({onCurrencyButtonPress, currencySymbol}: CurrencySymbolButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <Tooltip text={translate('common.selectCurrency')}>
            <PressableWithoutFeedback
                onPress={onCurrencyButtonPress}
                accessibilityLabel={translate('common.selectCurrency')}
                role={CONST.ROLE.BUTTON}
            >
                <Text style={styles.iouAmountText}>{currencySymbol}</Text>
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

CurrencySymbolButton.displayName = 'CurrencySymbolButton';

export default CurrencySymbolButton;
