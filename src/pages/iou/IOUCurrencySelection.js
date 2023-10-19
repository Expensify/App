import React, {useState, useMemo, useCallback, useRef} from 'react';
import {Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import OptionsSelector from '../../components/OptionsSelector';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {withNetwork} from '../../components/OnyxProvider';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import ROUTES from '../../ROUTES';
import themeColors from '../../styles/themes/default';
import * as Expensicons from '../../components/Icon/Expensicons';
import {iouPropTypes, iouDefaultProps} from './propTypes';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

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
                customIcon: isSelectedCurrency ? greenCheckmark : undefined,
                boldStyle: isSelectedCurrency,
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
                          title: translate('iOUCurrencySelection.allCurrencies'),
                          data: filteredCurrencies,
                          shouldShow: true,
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
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('iOUCurrencySelection.selectCurrency')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.MONEY_REQUEST.getRoute(iouType, reportID))}
                    />
                    <OptionsSelector
                        sections={sections}
                        onSelectRow={confirmCurrencySelection}
                        value={searchValue}
                        onChangeText={setSearchValue}
                        textInputLabel={translate('common.search')}
                        headerMessage={headerMessage}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                        shouldHaveOptionSeparator
                        autoFocus={false}
                        ref={optionsSelectorRef}
                    />
                </>
            )}
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
