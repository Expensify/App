import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ROUTES from '../ROUTES';
import Navigation from '../libs/Navigation/Navigation';
import CONST from '../CONST';
import SelectionListRadio from '../components/SelectionListRadio';

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
                isSelected: value === currentYear,
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
        const routes = lodashGet(this.props.navigation.getState(), 'routes', []);
        const dateOfBirthRoute = _.find(routes, (route) => route.name === 'Settings_PersonalDetails_DateOfBirth');

        if (dateOfBirthRoute) {
            Navigation.setParams({year: selectedYear.toString()}, lodashGet(dateOfBirthRoute, 'key', ''));
            Navigation.goBack();
        } else {
            Navigation.goBack(`${ROUTES.SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH}?year=${selectedYear}`);
        }
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
                <HeaderWithBackButton
                    title={this.props.translate('yearPickerPage.year')}
                    onBackButtonPress={() => Navigation.goBack(`${this.props.route.params.backTo}?year=${this.currentYear}` || ROUTES.HOME)}
                />
                <SelectionListRadio
                    textInputLabel={this.props.translate('yearPickerPage.selectYear')}
                    textInputValue={this.state.inputText}
                    textInputMaxLength={4}
                    onChangeText={this.filterYearList}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    headerMessage={headerMessage}
                    sections={[{data: this.state.yearOptions, indexOffset: 0}]}
                    onSelectRow={(option) => this.updateSelectedYear(option.value)}
                    initiallyFocusedOptionKey={this.currentYear.toString()}
                />
            </ScreenWrapper>
        );
    }
}

YearPickerPage.propTypes = propTypes;
YearPickerPage.defaultProps = defaultProps;

export default withLocalize(YearPickerPage);
