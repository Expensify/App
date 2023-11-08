import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SelectionList from './SelectionList';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Label for the search text input */
    textInputLabel: PropTypes.string.isRequired,

    /** Callback to fire when a currency is selected */
    onSelect: PropTypes.func.isRequired,

    /** Currency item to be selected initially */
    initiallySelectedCurrencyCode: PropTypes.string.isRequired,

    /** Currency item to be focused initially */
    initiallyFocusedCurrencyCode: PropTypes.string.isRequired,

    // The curency list constant object from Onyx
    currencyList: PropTypes.objectOf(
        PropTypes.shape({
            // Symbol for the currency
            symbol: PropTypes.string,

            // Name of the currency
            name: PropTypes.string,

            // ISO4217 Code for the currency
            ISO4217: PropTypes.string,
        }),
    ),

    ...withLocalizePropTypes,
};

const defaultProps = {
    currencyList: {},
};

function CurrencySelectionList(props) {
    const [searchValue, setSearchValue] = useState('');
    const {translate, currencyList} = props;

    const {sections, headerMessage} = useMemo(() => {
        const currencyOptions = _.map(currencyList, (currencyInfo, currencyCode) => {
            const isSelectedCurrency = currencyCode === props.initiallySelectedCurrencyCode;
            return {
                currencyName: currencyInfo.name,
                text: `${currencyCode} - ${CurrencyUtils.getLocalizedCurrencySymbol(currencyCode)}`,
                currencyCode,
                keyForList: currencyCode,
                isSelected: isSelectedCurrency,
            };
        });

        const searchRegex = new RegExp(Str.escapeForRegExp(searchValue.trim().replace(CONST.REGEX.ANY_SPACE, ' ')), 'i');
        const filteredCurrencies = _.filter(
            currencyOptions,
            (currencyOption) =>
                searchRegex.test(currencyOption.text.replace(CONST.REGEX.ANY_SPACE, ' ')) || searchRegex.test(currencyOption.currencyName.replace(CONST.REGEX.ANY_SPACE, ' ')),
        );
        const isEmpty = searchValue.trim() && !filteredCurrencies.length;

        return {
            sections: isEmpty ? [] : [{data: filteredCurrencies, indexOffset: 0}],
            headerMessage: isEmpty ? translate('common.noResultsFound') : '',
        };
    }, [currencyList, searchValue, translate, props.initiallySelectedCurrencyCode]);

    return (
        <SelectionList
            sections={sections}
            textInputLabel={props.textInputLabel}
            textInputValue={searchValue}
            onChangeText={setSearchValue}
            onSelectRow={props.onSelect}
            headerMessage={headerMessage}
            initiallyFocusedOptionKey={props.initiallyFocusedCurrencyCode}
            showScrollIndicator
        />
    );
}

CurrencySelectionList.displayName = 'CurrencySelectionList';
CurrencySelectionList.propTypes = propTypes;
CurrencySelectionList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    }),
)(CurrencySelectionList);
