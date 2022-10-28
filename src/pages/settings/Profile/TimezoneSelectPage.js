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

        this.currentSelectedTimezone = lodashGet(props.currentUserPersonalDetails, 'timezone.selected', CONST.DEFAULT_TIME_ZONE.selected);
        this.allTimezones = _.chain(moment.tz.names())
            .filter(timezone => !timezone.startsWith('Etc/GMT'))
            .map(timezone => ({
                text: timezone,
                keyForList: timezone,

                // Add green checkmark icon & bold the timezone text
                isSelected: timezone === this.currentSelectedTimezone,
                isUnread: timezone === this.currentSelectedTimezone,
            }))
            .value();

        this.state = {
            timezoneInputText: this.currentSelectedTimezone,
            timezoneOptions: this.allTimezones,
        };
    }

    /**
     * @param {Object} timezone
     * @param {String} timezone.label
     */
    saveSelectedTimezone({label}) {
        PersonalDetails.updateSelectedTimezone(label);
    }

    /**
     * @param {String} searchText
     */
    filterShownTimezones(searchText) {
        this.setState({
            timezoneInputText: searchText,
            timezoneOptions: _.filter(this.allTimezones, (tz => tz.text.toLowerCase().startsWith(searchText.toLowerCase()))),
        });
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('timezonePage.timezone')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_TIMEZONE_INITIAL)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <OptionsSelector
                    textInputLabel={this.props.translate('timezonePage.timezone')}
                    value={this.state.timezoneInputText}
                    onChangeText={this.filterShownTimezones}
                    onSelectRow={this.saveSelectedTimezone}
                    optionHoveredStyle={styles.hoveredComponentBG}
                    sections={[{data: this.state.timezoneOptions}]}
                />
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
