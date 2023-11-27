import PropTypes from 'prop-types';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';
import Tooltip from './Tooltip';

const propTypes = {
    /** Currency symbol of selected currency */
    currencySymbol: PropTypes.string.isRequired,

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: PropTypes.func.isRequired,
};

function CurrencySymbolButton({onCurrencyButtonPress, currencySymbol}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <Tooltip text={translate('common.selectCurrency')}>
            <PressableWithoutFeedback
                onPress={onCurrencyButtonPress}
                accessibilityLabel={translate('common.selectCurrency')}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Text style={styles.iouAmountText}>{currencySymbol}</Text>
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

CurrencySymbolButton.propTypes = propTypes;
CurrencySymbolButton.displayName = 'CurrencySymbolButton';

export default CurrencySymbolButton;
