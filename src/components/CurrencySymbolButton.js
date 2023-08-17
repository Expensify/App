import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import CONST from '../CONST';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /** Currency symbol of selected currency */
    currencySymbol: PropTypes.string.isRequired,

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: PropTypes.func.isRequired,
};

function CurrencySymbolButton({onCurrencyButtonPress, currencySymbol}) {
    const {translate} = useLocalize();
    return (
        <Tooltip text={translate('iOUCurrencySelection.selectCurrency')}>
            <PressableWithoutFeedback
                onPress={onCurrencyButtonPress}
                accessibilityLabel={translate('iOUCurrencySelection.selectCurrency')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Text style={styles.iouAmountText}>{currencySymbol}</Text>
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

CurrencySymbolButton.propTypes = propTypes;
CurrencySymbolButton.displayName = 'CurrencySymbolButton';

export default CurrencySymbolButton;
