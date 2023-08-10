import lodashGet from 'lodash/get';
import React, {useState, useRef} from 'react';
import _ from 'underscore';
import moment from 'moment-timezone';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import CONST from '../../../CONST';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import SelectionListRadio from '../../../components/SelectionListRadio';
import useLocalize from '../../../hooks/useLocalize';

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

/**
 * We add the current time to the key to fix a bug where the list options don't update unless the key is updated.
 * @param {String} text
 * @return {string} key for list item
 */
const getKey = (text) => `${text}-${new Date().getTime()}`;

/**
 * @param {Object} currentUserPersonalDetails
 * @return {Object} user's timezone data
 */
const getUserTimezone = (currentUserPersonalDetails) => lodashGet(currentUserPersonalDetails, 'timezone', CONST.DEFAULT_TIME_ZONE);

function TimezoneSelectPage(props) {
    const {translate} = useLocalize();
    const timezone = useRef(getUserTimezone(props.currentUserPersonalDetails));
    const allTimezones = useRef(
        _.chain(moment.tz.names())
            .filter((tz) => !tz.startsWith('Etc/GMT'))
            .map((text) => ({
                text,
                keyForList: getKey(text),
                isSelected: text === timezone.current.selected,
            }))
            .value(),
    );
    const [timezoneInputText, setTimezoneInputText] = useState(timezone.current.selected);
    const [timezoneOptions, setTimezoneOptions] = useState(allTimezones.current);

    /**
     * @param {Object} timezone
     * @param {String} timezone.text
     */
    const saveSelectedTimezone = ({text}) => {
        PersonalDetails.updateSelectedTimezone(text);
    };

    /**
     * @param {String} searchText
     */
    const filterShownTimezones = (searchText) => {
        setTimezoneInputText(searchText);
        setTimezoneOptions(_.filter(allTimezones.current, (tz) => tz.text.toLowerCase().includes(searchText.trim().toLowerCase())));
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('timezonePage.timezone')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_TIMEZONE)}
            />
            <SelectionListRadio
                textInputLabel={translate('timezonePage.timezone')}
                textInputValue={timezoneInputText}
                onChangeText={filterShownTimezones}
                onSelectRow={saveSelectedTimezone}
                sections={[{data: timezoneOptions, indexOffset: 0, isDisabled: timezone.current.automatic}]}
                initiallyFocusedOptionKey={_.get(_.filter(timezoneOptions, (tz) => tz.text === timezone.current.selected)[0], 'keyForList')}
            />
        </ScreenWrapper>
    );
}

TimezoneSelectPage.propTypes = propTypes;
TimezoneSelectPage.defaultProps = defaultProps;

export default withCurrentUserPersonalDetails(TimezoneSelectPage);
