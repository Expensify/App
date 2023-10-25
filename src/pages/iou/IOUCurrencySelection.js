import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {withNetwork} from '../../components/OnyxProvider';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import * as ReportActionsUtils from '../../libs/ReportActionsUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import ROUTES from '../../ROUTES';
import {iouPropTypes, iouDefaultProps} from './propTypes';
import SelectionList from '../../components/SelectionList';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,

            /** Currently selected currency */
            currency: PropTypes.string,

            /** Route to navigate back after selecting a currency */
            backTo: PropTypes.string,
        }),
    }).isRequired,

    // The currency list constant object from Onyx
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

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    currencyList: {},
    iou: iouDefaultProps,
};

function IOUCurrencySelection(props) {
    const [searchValue, setSearchValue] = useState('');
    const optionsSelectorRef = useRef();
    const selectedCurrencyCode = (lodashGet(props.route, 'params.currency', props.iou.currency) || CONST.CURRENCY.USD).toUpperCase();
    const iouType = lodashGet(props.route, 'params.iouType', CONST.IOU.TYPE.REQUEST);
    const reportID = lodashGet(props.route, 'params.reportID', '');
    const threadReportID = lodashGet(props.route, 'params.threadReportID', '');

    // Decides whether to allow or disallow editing a money request
    useEffect(() => {
        // Do not dismiss the modal, when it is not the edit flow.
        if (!threadReportID) {
            return;
        }

        const report = ReportUtils.getReport(threadReportID);
        const parentReportAction = ReportActionsUtils.getReportAction(report.parentReportID, report.parentReportActionID);

        // Do not dismiss the modal, when a current user can edit this currency of this money request.
        if (ReportUtils.canEditFieldOfMoneyRequest(parentReportAction, report.parentReportID, CONST.EDIT_REQUEST_FIELD.CURRENCY)) {
            return;
        }

        // Dismiss the modal when a current user cannot edit a money request.
        Navigation.isNavigationReady().then(() => {
            Navigation.dismissModal();
        });
    }, [threadReportID]);

    const confirmCurrencySelection = useCallback(
        (option) => {
            const backTo = lodashGet(props.route, 'params.backTo', '');
            Keyboard.dismiss();

            // When we refresh the web, the money request route gets cleared from the navigation stack.
            // Navigating to "backTo" will result in forward navigation instead, causing disruption to the currency selection.
            // To prevent any negative experience, we have made the decision to simply close the currency selection page.
            if (_.isEmpty(backTo) || props.navigation.getState().routes.length === 1) {
                Navigation.goBack(ROUTES.HOME);
            } else {
                Navigation.navigate(`${props.route.params.backTo}?currency=${option.currencyCode}`);
            }
        },
        [props.route, props.navigation],
    );

    const {translate, currencyList} = props;
    const {sections, headerMessage, initiallyFocusedOptionKey} = useMemo(() => {
        const currencyOptions = _.map(currencyList, (currencyInfo, currencyCode) => {
            const isSelectedCurrency = currencyCode === selectedCurrencyCode;
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
                _.find(filteredCurrencies, (currency) => currency.currencyCode === selectedCurrencyCode),
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
    }, [currencyList, searchValue, selectedCurrencyCode, translate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            onEntryTransitionEnd={() => optionsSelectorRef.current && optionsSelectorRef.current.focus()}
            testID={IOUCurrencySelection.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.selectCurrency')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID))}
            />
            <SelectionList
                sections={sections}
                textInputLabel={translate('common.search')}
                textInputValue={searchValue}
                onChangeText={setSearchValue}
                onSelectRow={confirmCurrencySelection}
                headerMessage={headerMessage}
                initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

IOUCurrencySelection.displayName = 'IOUCurrencySelection';
IOUCurrencySelection.propTypes = propTypes;
IOUCurrencySelection.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
        iou: {key: ONYXKEYS.IOU},
    }),
    withNetwork(),
)(IOUCurrencySelection);
