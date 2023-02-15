import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import _ from 'underscore';
import moment from 'moment-timezone';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import OptionsSelector from '../../../components/OptionsSelector';
import themeColors from '../../../styles/themes/default';
import * as Expensicons from '../../../components/Icon/Expensicons';

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class TimezoneSelectPage extends Component {
    constructor(props) {
        super(props);

        this.saveSelectedTimezone = this.saveSelectedTimezone.bind(this);
        this.filterShownTimezones = this.filterShownTimezones.bind(this);

        this.timezone = lodashGet(props.currentUserPersonalDetails, 'timezone', CONST.DEFAULT_TIME_ZONE);
        this.allTimezones = _.chain(moment.tz.names())
            .filter(timezone => !timezone.startsWith('Etc/GMT'))
            .map(timezone => ({
                text: timezone,
                keyForList: timezone,

                // Include the green checkmark icon to indicate the currently selected value
                customIcon: timezone === this.timezone.selected ? greenCheckmark : undefined,

                // This property will make the currently selected value have bold text
                boldStyle: timezone === this.timezone.selected,
            }))
            .value();

        this.state = {
            timezoneInputText: this.timezone.selected,
            timezoneOptions: this.allTimezones,
        };
    }

    componentDidUpdate() {
        // Update timezoneInputText & all timezoneOptions when the timezone object changes
        const newTimezone = lodashGet(this.props.currentUserPersonalDetails, 'timezone', CONST.DEFAULT_TIME_ZONE);
        if (_.isEqual(this.timezone, newTimezone)) { return; }
        this.timezone = newTimezone;
        const updatedAllTimezones = _.map(this.allTimezones, timezone => ({
            ...timezone,

            // Include the green checkmark icon to indicate the currently selected value
            customIcon: timezone === this.timezone.selected ? greenCheckmark : undefined,

            // This property will make the currently selected value have bold text
            boldStyle: timezone === this.timezone.selected,
        }));

        this.setState({
            timezoneInputText: this.timezone.selected,
            timezoneOptions: updatedAllTimezones,
        });
    }

    /**
     * @param {Object} timezone
     * @param {String} timezone.text
     */
    saveSelectedTimezone({text}) {
        PersonalDetails.updateSelectedTimezone(text);
    }

    /**
     * @param {String} searchText
     */
    filterShownTimezones(searchText) {
        this.setState({
            timezoneInputText: searchText,
            timezoneOptions: _.filter(this.allTimezones, (tz => tz.text.toLowerCase().includes(searchText.toLowerCase()))),
        });
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                {({safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.translate('timezonePage.timezone')}
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_TIMEZONE)}
                            onCloseButtonPress={() => Navigation.dismissModal(true)}
                        />
                        <OptionsSelector
                            textInputLabel={this.props.translate('timezonePage.timezone')}
                            value={this.state.timezoneInputText}
                            onChangeText={this.filterShownTimezones}
                            onSelectRow={this.saveSelectedTimezone}
                            optionHoveredStyle={styles.hoveredComponentBG}
                            sections={[{data: this.state.timezoneOptions, isDisabled: this.timezone.automatic}]}
                            shouldHaveOptionSeparator
                            safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        />
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

TimezoneSelectPage.propTypes = propTypes;
TimezoneSelectPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(TimezoneSelectPage);
