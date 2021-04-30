import React, {Component} from 'react';
import {Pressable, SectionList, View} from 'react-native';
import PropTypes from 'prop-types';
import Onyx, {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../../styles/styles';
import {fetchCurrencyPreferences, getCurrencyList} from '../../libs/actions/PersonalDetails';
import ONYXKEYS from '../../ONYXKEYS';
import {getCurrencyListForSections} from '../../libs/OptionsListUtils';
import Text from '../../components/Text';
import OptionRow from '../home/sidebar/OptionRow';
import themeColors from '../../styles/themes/default';
import TextInputWithFocusStyles from '../../components/TextInputWithFocusStyles';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({

        // Preferred Currency Code of the current user
        preferredCurrencyCode: PropTypes.string,

        // Currency Symbol of the Preferred Currency
        preferredCurrencySymbol: PropTypes.string,
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
};

const defaultProps = {
    myPersonalDetails: {preferredCurrencyCode: 'USD', preferredCurrencySymbol: '$'},
    currencyList: {},
};

class IOUCurrencySelection extends Component {
    constructor(props) {
        super(props);

        const {currencyOptions} = getCurrencyListForSections(this.getCurrencyOptions(this.props.currencyList),
            '');

        this.state = {
            searchValue: '',
            currencyData: currencyOptions,
            selectedCurrency: {
                currencyCode: this.props.myPersonalDetails.preferredCurrencyCode,
                currencySymbol: this.props.myPersonalDetails.preferredCurrencySymbol,
            },
        };
        this.getCurrencyOptions = this.getCurrencyOptions.bind(this);
        this.toggleOption = this.toggleOption.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.getSections = this.getSections.bind(this);
    }

    componentDidMount() {
        fetchCurrencyPreferences(true);
        getCurrencyList();
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
            title: 'ALL CURRENCIES',
            data: this.state.currencyData,
            shouldShow: true,
            indexOffset: 0,
        });

        return sections;
    }

    /**
     *
     * @returns {Object}
     */
    getCurrencyOptions() {
        const currencyListKeys = _.keys(this.props.currencyList);
        const currencyOptions = _.map(currencyListKeys, currencyCode => ({
            text: `${currencyCode} - ${this.props.currencyList[currencyCode].symbol}`,
            searchText: `${currencyCode} ${this.props.currencyList[currencyCode].symbol}`,
            currencyCode,
        }));
        return currencyOptions;
    }

    /**
     * Function which renders a row in the list
     *
     * @param {String} currencyCode
     *
     */
    toggleOption(currencyCode) {
        this.setState({
            selectedCurrency: {
                currencyCode,
                currencySymbol: this.props.currencyList[currencyCode].symbol,
            },
        });
    }

    /**
     * Returns the key used by the list
     * @param {Object} option
     * @return {String}
     */
    extractKey(option) {
        return option.currencyCode;
    }

    /**
     * Function which renders a row in the list
     *
     * @param {Object} params
     * @param {Object} params.item
     *
     * @return {Component}
     */
    renderItem({item, key}) {
        return (
            <OptionRow
                key={key}
                mode="compact"
                option={item}
                onSelectRow={() => this.toggleOption(item.currencyCode)}
                isSelected={item.currencyCode === this.state.selectedCurrency.currencyCode}
                showSelectedState
                hideAdditionalOptionStates
            />
        );
    }

    render() {
        const sections = this.getSections();
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title="Select a currency"
                    onCloseButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.flex1, styles.w100]}>
                    <View style={[styles.flex1]}>
                        <View style={[styles.ph5, styles.pv3]}>
                            <TextInputWithFocusStyles
                                styleFocusIn={[styles.textInputReversedFocus]}
                                ref={el => this.textInput = el}
                                style={[styles.textInput]}
                                value={this.state.searchValue}
                                onChangeText={(searchValue = '') => {
                                    const {currencyOptions} = getCurrencyListForSections(
                                        this.getCurrencyOptions(this.props.currencyList),
                                        searchValue,
                                    );
                                    this.setState({
                                        searchValue,
                                        currencyData: currencyOptions,
                                    });
                                }}
                                placeholder="Search"
                                placeholderTextColor={themeColors.placeholderText}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <SectionList
                                bounces={false}
                                indicatorStyle="white"
                                keyboardShouldPersistTaps="always"
                                showsVerticalScrollIndicator={false}
                                sections={sections}
                                keyExtractor={this.extractKey}
                                stickySectionHeadersEnabled={false}
                                renderItem={this.renderItem}
                                renderSectionHeader={({section: {title}}) => (
                                    <View>
                                        <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                                            {title}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                    <View style={[styles.ph5, styles.pb5]}>
                        <Pressable
                            onPress={() => {
                                Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, {
                                    preferredCurrencyCode: this.state.selectedCurrency.currencyCode,
                                    preferredCurrencySymbol: this.state.selectedCurrency.currencySymbol,
                                });
                                Navigation.dismissModal();
                            }}
                            style={({hovered}) => [
                                styles.button,
                                styles.buttonSuccess,
                                styles.w100,
                                hovered && styles.buttonSuccessHovered,
                            ]}
                        >
                            <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                                Confirm
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
}

IOUCurrencySelection.propTypes = propTypes;
IOUCurrencySelection.defaultProps = defaultProps;
IOUCurrencySelection.displayName = 'IOUCurrencySelection';

export default withOnyx({
    currencyList: {key: ONYXKEYS.CURRENCY_LIST},
    myPersonalDetails: {key: ONYXKEYS.MY_PERSONAL_DETAILS},
})(IOUCurrencySelection);
