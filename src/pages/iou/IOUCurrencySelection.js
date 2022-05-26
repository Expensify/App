import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
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
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {
    // The currency list constant object from Onyx
    currencyList: PropTypes.objectOf(PropTypes.shape({
        // Symbol for the currency
        symbol: PropTypes.string,

        // Name of the currency
        name: PropTypes.string,

        // ISO4217 Code for the currency
        ISO4217: PropTypes.string,
    })),

    /** Information about the network from Onyx */
    network: networkPropTypes.isRequired,
    ...withLocalizePropTypes,

};

const defaultProps = {
    currencyList: {},
};

class IOUCurrencySelection extends Component {
    constructor(props) {
        super(props);

        const {currencyOptions} = OptionsListUtils.getCurrencyListForSections(this.getCurrencyOptions(this.props.currencyList), '');

        this.state = {
            searchValue: '',
            currencyData: currencyOptions,
        };
        this.getCurrencyOptions = this.getCurrencyOptions.bind(this);
        this.getSections = this.getSections.bind(this);
        this.confirmCurrencySelection = this.confirmCurrencySelection.bind(this);
        this.changeSearchValue = this.changeSearchValue.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.network.isOffline || this.props.network.isOffline) {
            return;
        }

        this.fetchData();
    }

    /**
     * Returns the sections needed for the OptionsSelector
     *
     * @param {Boolean} maxParticipantsReached
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

    fetchData() {
        PersonalDetails.getCurrencyList();
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
    }),
    withNetwork(),
)(IOUCurrencySelection);
