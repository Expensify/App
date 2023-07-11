import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import _ from 'underscore';
import moment from 'moment-timezone';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONST from '../../../CONST';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import SelectionListRadio from '../../../components/SelectionListRadio';

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
        this.getTimezoneOption = this.getTimezoneOption.bind(this);

        this.timezone = this.getUserTimezone(props.currentUserPersonalDetails);
        this.allTimezones = _.chain(moment.tz.names())
            .filter((timezone) => !timezone.startsWith('Etc/GMT'))
            .map(this.getTimezoneOption)
            .value();

        this.state = {
            timezoneInputText: this.timezone.selected,
            timezoneOptions: this.allTimezones,
        };
    }

    componentDidUpdate() {
        // componentDidUpdate is added in order to update the timezone options when automatic is toggled on/off as
        // navigating back doesn't unmount the page, thus it won't update the timezone options & stay disabled without this.
        const newTimezone = this.getUserTimezone(this.props.currentUserPersonalDetails);
        if (_.isEqual(this.timezone, newTimezone)) {
            return;
        }
        this.timezone = newTimezone;
        this.allTimezones = _.map(this.allTimezones, (timezone) => {
            const text = timezone.text.split('-')[0];
            return this.getTimezoneOption(text);
        });

        this.setState({
            timezoneInputText: this.timezone.selected,
            timezoneOptions: this.allTimezones,
        });
    }

    /**
     * We add the current time to the key to fix a bug where the list options don't update unless the key is updated.
     * @param {String} text
     * @return {string} key for list item
     */
    getKey(text) {
        return `${text}-${new Date().getTime()}`;
    }

    /**
     * Get timezone option object for the list.
     * @param {String} text
     * @return {Object} Timezone list option
     */
    getTimezoneOption(text) {
        return {
            text,
            keyForList: this.getKey(text),
            isSelected: text === this.timezone.selected,
        };
    }

    /**
     * @param {Object} currentUserPersonalDetails
     * @return {Object} user's timezone data
     */
    getUserTimezone(currentUserPersonalDetails) {
        return lodashGet(currentUserPersonalDetails, 'timezone', CONST.DEFAULT_TIME_ZONE);
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
            timezoneOptions: _.filter(this.allTimezones, (tz) => tz.text.toLowerCase().includes(searchText.trim().toLowerCase())),
        });
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithBackButton
                    title={this.props.translate('timezonePage.timezone')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_TIMEZONE)}
                />
                <SelectionListRadio
                    textInputLabel={this.props.translate('timezonePage.timezone')}
                    textInputValue={this.state.timezoneInputText}
                    onChangeText={this.filterShownTimezones}
                    onSelectRow={this.saveSelectedTimezone}
                    sections={[{data: this.state.timezoneOptions, indexOffset: 0, isDisabled: this.timezone.automatic}]}
                    initiallyFocusedOptionKey={_.get(_.filter(this.state.timezoneOptions, (tz) => tz.text === this.timezone.selected)[0], 'keyForList')}
                />
            </ScreenWrapper>
        );
    }
}

TimezoneSelectPage.propTypes = propTypes;
TimezoneSelectPage.defaultProps = defaultProps;

export default compose(withLocalize, withCurrentUserPersonalDetails)(TimezoneSelectPage);
