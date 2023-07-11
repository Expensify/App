import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import CONST from '../CONST';

const propTypes = {
    /** Currency symbol of selected currency */
    currencySymbol: PropTypes.string.isRequired,

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

function CurrencySymbolButton(props) {
    return (
        <Tooltip text={props.translate('iOUCurrencySelection.selectCurrency')}>
            <PressableWithoutFeedback
                onPress={props.onCurrencyButtonPress}
                accessibilityLabel={props.translate('iOUCurrencySelection.selectCurrency')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Text style={styles.iouAmountText}>{props.currencySymbol}</Text>
            </PressableWithoutFeedback>
        </Tooltip>
    );
}

CurrencySymbolButton.propTypes = propTypes;
CurrencySymbolButton.displayName = 'CurrencySymbolButton';

export default withLocalize(CurrencySymbolButton);
