import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {getUrlWithBackToParam} from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';

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
    /** The draft transaction object being modified in Onyx */
    draftTransaction: transactionPropTypes,
};

const defaultProps = {
    currencyList: {},
    draftTransaction: {},
};

function IOURequestStepCurrency({
    currencyList,
    route: {
        params: {backTo, iouType, pageIndex, reportID, transactionID, action},
    },
    draftTransaction,
}) {
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');
    const optionsSelectorRef = useRef();
    const {currency} = ReportUtils.getTransactionDetails(draftTransaction);

    const navigateBack = () => {
        // If the currency selection was done from the confirmation step (eg. + > request money > manual > confirm > amount > currency)
        // then the user needs taken back to the confirmation page instead of the initial amount page. This is because the route params
        // are only able to handle one backTo param at a time and the user needs to go back to the amount page before going back
        // to the confirmation page
        if (pageIndex === 'confirm') {
            const routeToAmountPageWithConfirmationAsBackTo = getUrlWithBackToParam(
                backTo,
                `/${ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID)}`,
            );
            Navigation.goBack(routeToAmountPageWithConfirmationAsBackTo);
            return;
        }
        Navigation.goBack(backTo);
    };

    /**
     * @param {Object} option
     * @param {String} options.currencyCode
     */
    const confirmCurrencySelection = (option) => {
        Keyboard.dismiss();
        IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, option.currencyCode, false, action === CONST.IOU.ACTION.EDIT);
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
            {({didScreenTransitionEnd}) => (
                <SelectionList
                    sections={sections}
                    ListItem={RadioListItem}
                    textInputLabel={translate('common.search')}
                    textInputValue={searchValue}
                    onChangeText={setSearchValue}
                    onSelectRow={(option) => {
                        if (!didScreenTransitionEnd) {
                            return;
                        }
                        confirmCurrencySelection(option);
                    }}
                    shouldDebounceRowSelect
                    headerMessage={headerMessage}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                    showScrollIndicator
                />
            )}
        </StepScreenWrapper>
    );
}

IOURequestStepCurrency.displayName = 'IOURequestStepCurrency';
IOURequestStepCurrency.propTypes = propTypes;
IOURequestStepCurrency.defaultProps = defaultProps;

export default compose(
    withFullTransactionOrNotFound,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
        draftTransaction: {
            key: ({route}) => {
                const transactionID = lodashGet(route, 'params.transactionID', 0);
                return `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`;
            },
        },
    }),
)(IOURequestStepCurrency);
