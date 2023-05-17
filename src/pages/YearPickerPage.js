import _ from 'underscore';
import React from 'react';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ROUTES from '../ROUTES';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import OptionsSelector from '../components/OptionsSelector';
import themeColors from '../styles/themes/default';
import * as Expensicons from '../components/Icon/Expensicons';
import CONST from '../CONST';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class YearPickerPage extends React.Component {
    constructor(props) {
        super(props);

        const {params} = props.route;
        const minYear = Number(params.min);
        const maxYear = Number(params.max);
        const currentYear = Number(params.year);

        this.currentYear = currentYear;
        this.yearList = _.map(
            Array.from({length: maxYear - minYear + 1}, (v, i) => i + minYear),
            (value) => ({
                text: value.toString(),
                value,
                keyForList: value.toString(),

                // Include the green checkmark icon to indicate the currently selected value
                customIcon: value === currentYear ? greenCheckmark : undefined,

                // This property will make the currently selected value have bold text
                boldStyle: value === currentYear,
            }),
        );

        this.updateYearOfBirth = this.updateSelectedYear.bind(this);
        this.filterYearList = this.filterYearList.bind(this);

        this.state = {
            inputText: '',
            yearOptions: this.yearList,
        };
    }

    /**
     * Function called on selection of the year, to take user back to the previous screen
     *
     * @param {String} selectedYear
     */
    updateSelectedYear(selectedYear) {
        // We have to navigate using concatenation here as it is not possible to pass a function as a route param
        Navigation.navigate(`${this.props.route.params.backTo}?year=${selectedYear}`);
    }

    /**
     * Function filtering the list of the items when using search input
     *
     * @param {String} text
     */
    filterYearList(text) {
        const searchText = text.replace(CONST.REGEX.NON_NUMERIC, '');
        this.setState((prevState) => {
            if (searchText === prevState.inputText) {
                return {};
            }
            return {
                inputText: searchText,
                yearOptions: _.filter(this.yearList, (year) => year.text.includes(searchText)),
            };
        });
    }

    render() {
        const headerMessage = this.state.inputText.trim() && !this.state.yearOptions.length ? this.props.translate('common.noResultsFound') : '';
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('yearPickerPage.year')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(`${this.props.route.params.backTo}?year=${this.currentYear}` || ROUTES.HOME)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <OptionsSelector
                    textInputLabel={this.props.translate('yearPickerPage.selectYear')}
                    onChangeText={this.filterYearList}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    maxLength={4}
                    value={this.state.inputText}
                    sections={[{data: this.state.yearOptions, indexOffset: 0}]}
                    onSelectRow={(option) => this.updateSelectedYear(option.value)}
                    headerMessage={headerMessage}
                    initiallyFocusedOptionKey={this.currentYear.toString()}
                    hideSectionHeaders
                    optionHoveredStyle={styles.hoveredComponentBG}
                    shouldHaveOptionSeparator
                    contentContainerStyles={[styles.ph5]}
                />
            </ScreenWrapper>
        );
    }
}

YearPickerPage.propTypes = propTypes;
YearPickerPage.defaultProps = defaultProps;

export default withLocalize(YearPickerPage);
