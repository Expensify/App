import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../withCurrentUserPersonalDetails';
import ScreenWrapper from '../../ScreenWrapper';
import HeaderWithBackButton from '../../HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import styles from '../../../styles/styles';
import OptionsSelector from '../../OptionsSelector';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../Icon/Expensicons';
import CONST from '../../../CONST';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Function to call when the user selects a year */
    onYearChange: PropTypes.func.isRequired,

    /** Function to call when the user closes the year picker */
    onClose: PropTypes.func.isRequired,

    /** Minimum year to show in the list */
    min: PropTypes.number,

    /** Maximum year to show in the list */
    max: PropTypes.number,

    /** Currently selected year */
    currentYear: PropTypes.number.isRequired,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
    min: moment().year(CONST.CALENDAR_PICKER.MIN_YEAR),
    max: moment().year(CONST.CALENDAR_PICKER.MAX_YEAR),
};

class YearPickerPage extends React.Component {
    constructor(props) {
        super(props);

        this.yearList = _.map(
            Array.from({length: props.max - props.min + 1}, (v, i) => i + props.min),
            (value) => ({
                text: value.toString(),
                value,
                keyForList: value.toString(),

                // Include the green checkmark icon to indicate the currently selected value
                customIcon: value === this.props.currentYear ? greenCheckmark : undefined,

                // This property will make the currently selected value have bold text
                boldStyle: value === this.props.currentYear,
            }),
        );

        this.filterYearList = this.filterYearList.bind(this);

        this.state = {
            inputText: '',
            yearOptions: this.yearList,
        };
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
            <ScreenWrapper
                style={[styles.navigationScreenCardStyle]}
                includeSafeAreaPaddingBottom={false}
            >
                <HeaderWithBackButton
                    title={this.props.translate('yearPickerPage.year')}
                    onBackButtonPress={this.props.onClose}
                />
                <OptionsSelector
                    textInputLabel={this.props.translate('yearPickerPage.selectYear')}
                    onChangeText={this.filterYearList}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    maxLength={4}
                    value={this.state.inputText}
                    sections={[{data: this.state.yearOptions, indexOffset: 0}]}
                    onSelectRow={(option) => this.props.onYearChange(option.value)}
                    headerMessage={headerMessage}
                    initiallyFocusedOptionKey={this.props.currentYear.toString()}
                    hideSectionHeaders
                    optionHoveredStyle={styles.hoveredComponentBG}
                    shouldHaveOptionSeparator
                    shouldDelayFocus
                />
            </ScreenWrapper>
        );
    }
}

YearPickerPage.propTypes = propTypes;
YearPickerPage.defaultProps = defaultProps;

export default withLocalize(YearPickerPage);
