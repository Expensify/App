import React, {useState, useCallback} from 'react';
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

const IOUCurrencySelection = (props) => {
    const selectedCurrencyCode = lodashGet(props.route, 'params.currency', props.iou.selectedCurrencyCode);;

    const getCurrencyOptions = useCallback(() => _.map(props.currencyList, (currencyCode) => {
            const isSelectedCurrency = currencyCode === selectedCurrencyCode;
            return {
                text: `${currencyCode} - ${CurrencyUtils.getLocalizedCurrencySymbol(currencyCode)}`,
                currencyCode,
                keyForList: currencyCode,
                customIcon: isSelectedCurrency ? greenCheckmark : undefined,
                boldStyle: isSelectedCurrency,
            };
        }),
    [selectedCurrencyCode, props.currencyList]);

    const confirmCurrencySelection = useCallback((option) => {
        const backTo = lodashGet(props.route, 'params.backTo', '');
        // When we refresh the web, the money request route gets cleared from the navigation stack.
        // Navigating to "backTo" will result in forward navigation instead, causing disruption to the currency selection.
        // To prevent any negative experience, we have made the decision to simply close the currency selection page.
        if (_.isEmpty(backTo) || props.navigation.getState().routes.length === 1) {
            Navigation.goBack();
        } else {
            Navigation.navigate(`${props.route.params.backTo}?currency=${option.currencyCode}`);
        }
    }, [props.route, props.navigation]);

    const [searchValue, setCurrentSearchValue] = useState('');
    const [currencyData, setCurrencyData] = useState(getCurrencyOptions); // just use a const? it doesn't seem to change...

    const getSections = useCallback(() => {
        if (searchValue.trim() && !currencyData.length) {
            return [];
        }
        const sections = [];
        sections.push({
            title: props.translate('iOUCurrencySelection.allCurrencies'),
            data: currencyData,
            shouldShow: true,
            indexOffset: 0,
        });

        return sections;
    },
    [searchValue, currencyData.length]);

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
                        onChangeText={setCurrentSearchValue}
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

    // /**
    //  * Sets new search value
    //  * @param {String} searchValue
    //  * @return {void}
    //  */
    // changeSearchValue(searchValue) {
    //     const currencyOptions = this.getCurrencyOptions(this.props.currencyList);
    //     const searchRegex = new RegExp(Str.escapeForRegExp(searchValue), 'i');
    //     const filteredCurrencies = _.filter(currencyOptions, (currencyOption) => searchRegex.test(currencyOption.text));

    //     this.setState({
    //         searchValue,
    //         currencyData: filteredCurrencies,
    //     });
    // }

    // // If we're coming from the confirm step, it means we were editing something so go back to the confirm step.
    // const confirmIndex = _.indexOf(steps, Steps.MoneyRequestConfirm);
    // if (previousStepIndex === confirmIndex) {
    //     navigateToStep(confirmIndex);
    //     return;
    // }

    // setPreviousStepIndex(currentStepIndex);
    // setCurrentStepIndex(currentStepIndex + 1);
// }, [currentStepIndex, previousStepIndex, navigateToStep, steps]);

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
