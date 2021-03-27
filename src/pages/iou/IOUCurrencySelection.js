import React, {Component} from 'react';
import {Pressable, SectionList, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import {getCurrencyList} from '../../libs/actions/PersonalDetails';
import ONYXKEYS from '../../ONYXKEYS';
import ScreenWrapper from '../../components/ScreenWrapper';
import {getCurrencyListForSections} from '../../libs/OptionsListUtils';
import Text from '../../components/Text';
import OptionRow from '../home/sidebar/OptionRow';
import themeColors from '../../styles/themes/default';
import TextInputWithFocusStyles from '../../components/TextInputWithFocusStyles';

/**
 * IOU Currency selection for selecting currency
 */
const propTypes = {

    // Callback that sets selectedCurrency in IOUModal
    onCurrencySelected: PropTypes.func.isRequired,

    // Callback that sets currency in Onyx and dismisses the currency mode
    onCurrencyConfirm: PropTypes.func,

    // User's currency preference
    selectedCurrency: PropTypes.string.isRequired,

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({

        // Preferred Currency Code of the current user
        preferredCurrencyCode: PropTypes.string,

        // Currency Symbol of the Preferred Currency
        preferredCurrencySymbol: PropTypes.string,
    }),

    // The currency list constant object from Onyx
    currencyList: PropTypes.objectOf(PropTypes.shape({
        symbol: PropTypes.string,
        name: PropTypes.string,
        ISO4217: PropTypes.string,
    })),
};

const defaultProps = {
    myPersonalDetails: {preferredCurrencyCode: 'USD', preferredCurrencySymbol: '$'},
    currencyList: {},
    onCurrencyConfirm: null,
};

class IOUCurrencySelection extends Component {
    constructor(props) {
        super(props);

        const {currencyOptions} = getCurrencyListForSections(this.props.currencyList,
            '');

        this.state = {
            searchValue: '',
            currencyData: currencyOptions,
        };
        this.renderItem = this.renderItem.bind(this);
        this.getSections = this.getSections.bind(this);
    }

    componentDidMount() {
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
     * @param {String} currencyCode
     *
     */
    toggleOption(currencyCode) {
        this.props.onCurrencySelected({
            currencyCode,
            currencySymbol: this.props.currencyList[currencyCode].symbol,
        });
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
                isSelected={item.currencyCode === this.props.selectedCurrency.currencyCode}
                showSelectedState
                hideAdditionalOptionStates
            />
        );
    }

    /**
     * Function which renders a section header component
     *
     * @param {Object} params
     * @param {Object} params.section
     * @param {String} params.section.title
     *
     * @return {Component}
     */
    renderSectionHeader({section: {title}}) {
        return (
            <View>
                <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                    {title}
                </Text>
            </View>
        );
    }

    render() {
        const sections = this.getSections();
        return (
            <ScreenWrapper>
                {() => (
                    <>
                        <View style={[styles.flex1, styles.w100]}>
                            <View style={[styles.ph5, styles.pv3]}>
                                <TextInputWithFocusStyles
                                    styleFocusIn={[styles.textInputReversedFocus]}
                                    ref={el => this.textInput = el}
                                    style={[styles.textInput]}
                                    value={this.state.searchValue}
                                    onChangeText={(searchValue = '') => {
                                        const {currencyOptions} = getCurrencyListForSections(
                                            this.props.currencyList,
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
                            <SectionList
                                bounces={false}
                                indicatorStyle="white"
                                keyboardShouldPersistTaps="always"
                                showsVerticalScrollIndicator={false}
                                sections={sections}
                                keyExtractor={this.extractKey}
                                stickySectionHeadersEnabled={false}
                                renderItem={this.renderItem}
                                renderSectionHeader={this.renderSectionHeader}
                            />
                            <View style={[styles.ph5, styles.pb5]}>
                                <Pressable
                                    onPress={this.props.onCurrencyConfirm}
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
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

IOUCurrencySelection.propTypes = propTypes;
IOUCurrencySelection.defaultProps = defaultProps;
IOUCurrencySelection.displayName = 'IOUModal';

export default withOnyx({currencyList: {key: ONYXKEYS.CURRENCY_LIST}})(IOUCurrencySelection);
