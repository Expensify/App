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
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';

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

        // Whether preferences for the currency are saved
        isCurrencyPreferencesSaved: PropTypes.bool,
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
    myPersonalDetails: {preferredCurrencyCode: CONST.CURRENCY.USD, preferredCurrencySymbol: '$'},
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
        this.getSections = this.getSections.bind(this);
        this.confirmCurrencySelection = this.confirmCurrencySelection.bind(this);
        this.changeSearchValue = this.changeSearchValue.bind(this);
    }

    componentDidMount() {
        getCurrencyList();
        if (!this.props.myPersonalDetails.isCurrencyPreferencesSaved) {
            fetchCurrencyPreferences();
        }
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
     * Sets new search value
     * @param {String} searchValue
     * @return {void}
     */
    changeSearchValue(searchValue) {
        const {currencyOptions} = getCurrencyListForSections(
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
     * @return {void}
     */
    confirmCurrencySelection() {
        Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, {
            preferredCurrencyCode: this.state.selectedCurrency.currencyCode,
            preferredCurrencySymbol: this.state.selectedCurrency.currencySymbol,
        });
        Navigation.goBack();
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('iOUCurrencySelection.selectCurrency')}
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
                                onChangeText={this.changeSearchValue}
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
                                sections={this.getSections()}
                                keyExtractor={option => option.currencyCode}
                                stickySectionHeadersEnabled={false}
                                renderItem={({item, key}) => (
                                    <OptionRow
                                        key={key}
                                        mode="compact"
                                        option={item}
                                        onSelectRow={() => this.toggleOption(item.currencyCode)}
                                        isSelected={item.currencyCode === this.state.selectedCurrency.currencyCode}
                                        showSelectedState
                                        hideAdditionalOptionStates
                                    />
                                )}
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
                            onPress={this.confirmCurrencySelection}
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

export default compose(
    withLocalize,
    withOnyx({
        currencyList: {key: ONYXKEYS.CURRENCY_LIST},
        myPersonalDetails: {key: ONYXKEYS.MY_PERSONAL_DETAILS},
    }),
)(IOUCurrencySelection);
