import React, {useState, useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '@src/ONYXKEYS';
import OptionsSelector from '@components/OptionsSelector';
import Navigation from '@libs/Navigation/Navigation';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import ROUTES from '@src/ROUTES';
import themeColors from '@styles/themes/default';
import * as Expensicons from '@components/Icon/Expensicons';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import * as IOU from '@userActions/IOU';
import StepScreenWrapper from './StepScreenWrapper';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

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
        IOU.setMoneeRequestCurrency_temporaryForRefactor(transactionID, option.currencyCode);
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
                customIcon: isSelectedCurrency ? greenCheckmark : undefined,
                boldStyle: isSelectedCurrency,
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
                          shouldShow: true,
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
                onSelectRow={confirmCurrencySelection}
                value={searchValue}
                onChangeText={setSearchValue}
                textInputLabel={translate('common.search')}
                headerMessage={headerMessage}
                initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                shouldHaveOptionSeparator
                autoFocus={false}
                ref={optionsSelectorRef}
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
        key: ({route}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${lodashGet(route, 'params.transactionID', '0')}`,
    },
})(IOURequestStepCurrency);
