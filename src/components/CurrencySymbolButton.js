import React from 'react';
import {TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text';
import styles from '../styles/styles';

const propTypes = {
    /** Currency symbol of selected currency */
    currencySymbol: PropTypes.string.isRequired,

    /** Function to call when currency button is pressed */
    onCurrencyButtonPress: PropTypes.func.isRequired,
};

function CurrencySymbolButton(props) {
    return (
        <TouchableOpacity onPress={props.onCurrencyButtonPress}>
            <Text style={styles.iouAmountText}>{props.currencySymbol}</Text>
        </TouchableOpacity>
    );
}

CurrencySymbolButton.propTypes = propTypes;
CurrencySymbolButton.displayName = 'CurrencySymbolButton';

export default CurrencySymbolButton;
