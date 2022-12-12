import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import OptionsSelector from '../../components/OptionsSelector';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as IOU from '../../libs/actions/IOU';
import * as CurrencySymbolUtils from '../../libs/CurrencySymbolUtils';
import {withNetwork} from '../../components/OnyxProvider';

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

    ...withLocalizePropTypes,
};

const defaultProps = {
    currencyList: {},
};

class IOUCurrencySelection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchValue: '',
            currencyData: this.getCurrencyOptions(this.props.currencyList),
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
        if (this.state.searchValue.trim() && !this.state.currencyData.length) {
            return [];
        }
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
            text: `${currencyCode} - ${CurrencySymbolUtils.getLocalizedCurrencySymbol(this.props.preferredLocale, currencyCode)}`,
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
        const currencyOptions = this.getCurrencyOptions(this.props.currencyList);
        const searchRegex = new RegExp(searchValue, 'i');
        const filteredCurrencies = _.filter(currencyOptions, currencyOption => searchRegex.test(currencyOption.text));

        this.setState({
            searchValue,
            currencyData: filteredCurrencies,
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
        const headerMessage = this.state.searchValue.trim() && !this.state.currencyData.length ? this.props.translate('common.noResultsFound') : '';
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('iOUCurrencySelection.selectCurrency')}
                    onCloseButtonPress={Navigation.goBack}
                />
                <OptionsSelector
                    sections={this.getSections()}
                    onSelectRow={this.confirmCurrencySelection}
                    value={this.state.searchValue}
                    onChangeText={this.changeSearchValue}
                    placeholderText={this.props.translate('common.search')}
                    headerMessage={headerMessage}
                />
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
