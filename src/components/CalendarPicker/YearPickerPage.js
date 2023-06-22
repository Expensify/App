import React from 'react';
import _ from 'underscore';
import CONST from '../../CONST';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import HeaderWithBackButton from '../HeaderWithBackButton';
import * as Expensicons from '../Icon/Expensicons';
import OptionsSelector from '../OptionsSelector';
import ScreenWrapper from '../ScreenWrapper';
import {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

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

        const minYear = Number(props.min);
        const maxYear = Number(props.max);
        const currentYear = Number(props.year);

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
