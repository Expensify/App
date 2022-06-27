import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import OptionsSelector from '../../components/OptionsSelector';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import * as IOU from '../../libs/actions/IOU';
import * as CurrencySymbolUtils from '../../libs/CurrencySymbolUtils';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import personalDetailsPropType from '../personalDetailsPropType';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {

    /** Personal details of all the users, including current user */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Holds data related to IOU */
    iou: PropTypes.shape({

        // Selected Currency Code of the current IOU
        selectedCurrencyCode: PropTypes.string,
    }),

    // The currency list constant object from Onyx
    currencyList: PropTypes.objectOf(PropTypes.shape({
        // Symbol for the currency
        symbol: PropTypes.string,

        // Name of the currency
        name: PropTypes.string,

        // ISO4217 Code for the currency
        ISO4217: PropTypes.string,
    })),

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    iou: {
        selectedCurrencyCode: CONST.CURRENCY.USD,
    },
    currencyList: {},
};

class IOUCurrencySelection extends Component {
    constructor(props) {
        super(props);

        const {currencyOptions} = OptionsListUtils.getCurrencyListForSections(this.getCurrencyOptions(this.props.currencyList), '');

        // Get my details from the list of personal details and set my local currency to USD if not already set
        this.myPersonalDetails = _.findWhere(props.personalDetails, {isCurrentUser: true});
        if (!_.has(this.myPersonalDetails, 'localCurrencyCode') || _.isEmpty(this.myPersonalDetails.localCurrencyCode)) {
            this.myPersonalDetails.localCurrencyCode = CONST.CURRENCY.USD;
        }

        this.state = {
            searchValue: '',
            currencyData: currencyOptions,
            toggledCurrencyCode: this.props.iou.selectedCurrencyCode || this.myPersonalDetails.localCurrencyCode,
        };
        this.getCurrencyOptions = this.getCurrencyOptions.bind(this);
        this.getSections = this.getSections.bind(this);
        this.confirmCurrencySelection = this.confirmCurrencySelection.bind(this);
        this.changeSearchValue = this.changeSearchValue.bind(this);
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @returns {Array}
     */
    getSections() {
        const sections = [];

        sections.push({
            title: this.props.translate('iOUCurrencySelection.allCurrencies'),
            data: this.state.currencyData,
            shouldShow: true,
            indexOffset: 0,
        });

        return sections;
    }

    /**
     * @returns {Object}
     */
    getCurrencyOptions() {
        return _.map(this.props.currencyList, (currencyInfo, currencyCode) => ({
            text: `${currencyCode} - ${currencyInfo.symbol}`,
            searchText: `${currencyCode} ${currencyInfo.symbol}`,
            currencyCode,
            keyForList: currencyCode,
        }));
    }

    /**
     * Sets new search value
     * @param {String} searchValue
     * @return {void}
     */
    changeSearchValue(searchValue) {
        const {currencyOptions} = OptionsListUtils.getCurrencyListForSections(
            this.getCurrencyOptions(this.props.currencyList),
            searchValue,
        );
        this.setState({
            searchValue,
            currencyData: currencyOptions,
        });
    }

    /**
     * Confirms the selection of currency and sets values in Onyx
     *
     * @param {Object} option
     * @param {String} option.currencyCode
     */
    confirmCurrencySelection(option) {
        IOU.setIOUSelectedCurrency(option.currencyCode);
        Navigation.goBack();
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('iOUCurrencySelection.selectCurrency')}
                        onCloseButtonPress={Navigation.goBack}
                    />
                    <OptionsSelector
                        sections={this.getSections()}
                        onSelectRow={this.confirmCurrencySelection}
                        value={this.state.searchValue}
                        onChangeText={this.changeSearchValue}
                        shouldDelayFocus
                        placeholderText={this.props.translate('common.search')}
                    />
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

IOUCurrencySelection.propTypes = propTypes;
IOUCurrencySelection.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
        personalDetails: {key: ONYXKEYS.PERSONAL_DETAILS},
        iou: {key: ONYXKEYS.IOU},
    }),
    withNetwork(),
)(IOUCurrencySelection);
