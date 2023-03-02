import React from 'react';
import {TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

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
            <TouchableOpacity onPress={props.onCurrencyButtonPress}>
                <Text style={styles.iouAmountText}>{props.currencySymbol}</Text>
            </TouchableOpacity>
        </Tooltip>
    );
}

CurrencySymbolButton.propTypes = propTypes;
CurrencySymbolButton.displayName = 'CurrencySymbolButton';

export default withLocalize(CurrencySymbolButton);
