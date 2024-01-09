import lodashGet from 'lodash/get';
import React, {useState} from 'react';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import TIMEZONES from '@src/TIMEZONES';

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
    const timezone = getUserTimezone(props.currentUserPersonalDetails);
    const allTimezones = useInitialValue(() =>
        _.chain(TIMEZONES)
            .filter((tz) => !tz.startsWith('Etc/GMT'))
            .map((text) => ({
                text,
                keyForList: getKey(text),
                isSelected: text === timezone.selected,
            }))
            .value(),
    );
    const [timezoneInputText, setTimezoneInputText] = useState('');
    const [timezoneOptions, setTimezoneOptions] = useState(allTimezones);

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
        const searchWords = searchText.toLowerCase().match(/[a-z0-9]+/g) || [];
        setTimezoneOptions(
            _.filter(allTimezones, (tz) =>
                _.every(
                    searchWords,
                    (word) =>
                        tz.text
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, ' ')
                            .indexOf(word) > -1,
                ),
            ),
        );
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={TimezoneSelectPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('timezonePage.timezone')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_TIMEZONE)}
            />
            <SelectionList
                headerMessage={timezoneInputText.trim() && !timezoneOptions.length ? translate('common.noResultsFound') : ''}
                textInputLabel={translate('timezonePage.timezone')}
                textInputValue={timezoneInputText}
                onChangeText={filterShownTimezones}
                onSelectRow={saveSelectedTimezone}
                sections={[{data: timezoneOptions, indexOffset: 0, isDisabled: timezone.automatic}]}
                initiallyFocusedOptionKey={_.get(_.filter(timezoneOptions, (tz) => tz.text === timezone.selected)[0], 'keyForList')}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

TimezoneSelectPage.propTypes = propTypes;
TimezoneSelectPage.defaultProps = defaultProps;
TimezoneSelectPage.displayName = 'TimezoneSelectPage';

export default withCurrentUserPersonalDetails(TimezoneSelectPage);
