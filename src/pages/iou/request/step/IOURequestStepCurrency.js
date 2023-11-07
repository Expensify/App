import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import OptionsSelector from '@components/OptionsSelector';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /** The currency list constant object from Onyx */
    currencyList: PropTypes.objectOf(
        PropTypes.shape({
            /** Symbol for the currency */
            symbol: PropTypes.string,

            /** Name of the currency */
            name: PropTypes.string,

            /** ISO4217 Code for the currency */
            ISO4217: PropTypes.string,
        }),
    ),

    /* Onyx Props */
    /** The transaction being modified */
    transaction: transactionPropTypes,
};

const defaultProps = {
    currencyList: {},
    transaction: {},
};

function IOURequestStepCurrency({
    currencyList,
    route: {
        params: {backTo, transactionID},
    },
    transaction: {currency},
}) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const optionsSelectorRef = useRef();

    const navigateBack = () => {
        Navigation.goBack(backTo || ROUTES.HOME, true);
    };

    /**
     * @param {Object} option
     * @param {String} options.currencyCode
     */
    const confirmCurrencySelection = (option) => {
        Keyboard.dismiss();
        IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, option.currencyCode);
        navigateBack();
    };

    const {sections, headerMessage, initiallyFocusedOptionKey} = useMemo(() => {
        const currencyOptions = _.map(currencyList, (currencyInfo, currencyCode) => {
            const isSelectedCurrency = currencyCode === currency.toUpperCase();
            return {
                currencyName: currencyInfo.name,
                text: `${currencyCode} - ${CurrencyUtils.getLocalizedCurrencySymbol(currencyCode)}`,
                currencyCode,
                keyForList: currencyCode,
                isSelected: isSelectedCurrency,
            };
        });

        const searchRegex = new RegExp(Str.escapeForRegExp(searchValue.trim()), 'i');
        const filteredCurrencies = _.filter(currencyOptions, (currencyOption) => searchRegex.test(currencyOption.text) || searchRegex.test(currencyOption.currencyName));
        const isEmpty = searchValue.trim() && !filteredCurrencies.length;

        return {
            initiallyFocusedOptionKey: _.get(
                _.find(filteredCurrencies, (filteredCurrency) => filteredCurrency.currencyCode === currency.toUpperCase()),
                'keyForList',
            ),
            sections: isEmpty
                ? []
                : [
                      {
                          data: filteredCurrencies,
                          indexOffset: 0,
                      },
                  ],
            headerMessage: isEmpty ? translate('common.noResultsFound') : '',
        };
    }, [currencyList, searchValue, currency, translate]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.selectCurrency')}
            onBackButtonPress={navigateBack}
            onEntryTransitionEnd={() => optionsSelectorRef.current && optionsSelectorRef.current.focus()}
            shouldShowWrapper
            testID={IOURequestStepCurrency.displayName}
        >
            <OptionsSelector
                sections={sections}
                textInputLabel={translate('common.search')}
                value={searchValue}
                onChangeText={setSearchValue}
                onSelectRow={confirmCurrencySelection}
                headerMessage={headerMessage}
                initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                showScrollIndicator
            />
        </StepScreenWrapper>
    );
}

IOURequestStepCurrency.displayName = 'IOURequestStepCurrency';
IOURequestStepCurrency.propTypes = propTypes;
IOURequestStepCurrency.defaultProps = defaultProps;

export default withOnyx({
    currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    transaction: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStepCurrency);
