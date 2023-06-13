import React, {useState, useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import OptionsSelector from '../../components/OptionsSelector';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import {withNetwork} from '../../components/OnyxProvider';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import themeColors from '../../styles/themes/default';
import * as Expensicons from '../../components/Icon/Expensicons';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {
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

    /* Onyx Props */

    /** Holds data related to IOU view state, rather than the underlying IOU data. */
    iou: PropTypes.shape({
        /** Selected Currency Code of the current IOU */
        selectedCurrencyCode: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    currencyList: {},
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
};

function IOUCurrencySelection(props) {
    const [searchValue, setCurrentSearchValue] = useState('');
    const selectedCurrencyCode = lodashGet(props.route, 'params.currency', props.iou.selectedCurrencyCode, CONST.CURRENCY.USD);
    const currencyOptions = useMemo(
        () =>
            _.map(props.currencyList, (currencyInfo, currencyCode) => {
                const isSelectedCurrency = currencyCode === selectedCurrencyCode;
                return {
                    text: `${currencyCode} - ${CurrencyUtils.getLocalizedCurrencySymbol(currencyCode)}`,
                    currencyCode,
                    keyForList: currencyCode,
                    customIcon: isSelectedCurrency ? greenCheckmark : undefined,
                    boldStyle: isSelectedCurrency,
                };
            }),
        [selectedCurrencyCode, props.currencyList],
    );

    const [currencyData, setCurrencyData] = useState(currencyOptions);

    const confirmCurrencySelection = useCallback(
        (option) => {
            const backTo = lodashGet(props.route, 'params.backTo', '');
            // When we refresh the web, the money request route gets cleared from the navigation stack.
            // Navigating to "backTo" will result in forward navigation instead, causing disruption to the currency selection.
            // To prevent any negative experience, we have made the decision to simply close the currency selection page.
            if (_.isEmpty(backTo) || props.navigation.getState().routes.length === 1) {
                Navigation.goBack();
            } else {
                Navigation.navigate(`${props.route.params.backTo}?currency=${option.currencyCode}`);
            }
        },
        [props.route, props.navigation],
    );

    const { translate } = props;

    const getSections = useMemo(() => {
        if (searchValue.trim() && !currencyData.length) {
            return [];
        }
        return [{
            title: translate('iOUCurrencySelection.allCurrencies'),
            data: currencyData,
            shouldShow: true,
            indexOffset: 0,
        }];

        return sections;
    }, [searchValue, currencyData, translate]);

    const changeSearchValue = useCallback(
        (searchQuery) => {
            const searchRegex = new RegExp(Str.escapeForRegExp(searchQuery), 'i');
            const filteredCurrencies = _.filter(currencyData, (currencyOption) => searchRegex.test(currencyOption.text));

            setCurrentSearchValue(searchQuery);
            setCurrencyData(filteredCurrencies);
        },
        [currencyData],
    );

    const headerMessage = searchValue.trim() && !currencyData.length ? props.translate('common.noResultsFound') : '';

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={props.translate('iOUCurrencySelection.selectCurrency')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.getIouRequestRoute(Navigation.getTopmostReportId()))}
                    />
                    <OptionsSelector
                        sections={getSections}
                        onSelectRow={confirmCurrencySelection}
                        value={searchValue}
                        onChangeText={changeSearchValue}
                        textInputLabel={props.translate('common.search')}
                        headerMessage={headerMessage}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        initiallyFocusedOptionKey={_.get(
                            _.find(currencyData, (currency) => currency.currencyCode === selectedCurrencyCode),
                            'keyForList',
                        )}
                        shouldHaveOptionSeparator
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
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    withNetwork(),
)(IOUCurrencySelection);
