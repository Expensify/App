import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {updateSelectedTimezone} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import TIMEZONES from '@src/TIMEZONES';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

type TimezoneSelectPageProps = Pick<WithCurrentUserPersonalDetailsProps, 'currentUserPersonalDetails'>;

/**
 * We add the current time to the key to fix a bug where the list options don't update unless the key is updated.
 */
const getKey = (text: string): string => `${text}-${new Date().getTime()}`;

const getUserTimezone = (currentUserPersonalDetails: ValueOf<WithCurrentUserPersonalDetailsProps, 'currentUserPersonalDetails'>) =>
    currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;

function TimezoneSelectPage({currentUserPersonalDetails}: TimezoneSelectPageProps) {
    const {translate} = useLocalize();
    const timezone = getUserTimezone(currentUserPersonalDetails);
    const allTimezones = useInitialValue(() =>
        TIMEZONES.filter((tz: string) => !tz.startsWith('Etc/GMT')).map((text: string) => ({
            text,
            keyForList: getKey(text),
            isSelected: text === timezone.selected,
        })),
    );
    const [timezoneInputText, setTimezoneInputText] = useState('');
    const [timezoneOptions, setTimezoneOptions] = useState(allTimezones);

    const saveSelectedTimezone = ({text}: {text: string}) => {
        updateSelectedTimezone(text as SelectedTimezone, currentUserPersonalDetails.accountID);
    };

    const filterShownTimezones = (searchText: string) => {
        setTimezoneInputText(searchText);
        const searchWords = searchText.toLowerCase().match(/[a-z0-9]+/g) ?? [];
        setTimezoneOptions(
            allTimezones.filter((tz) =>
                searchWords.every((word) =>
                    tz.text
                        .toLowerCase()
                        .replaceAll(/[^a-z0-9]/g, ' ')
                        .includes(word),
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
                shouldSingleExecuteRowSelect
                sections={[{data: timezoneOptions, isDisabled: timezone.automatic}]}
                initiallyFocusedOptionKey={timezoneOptions.find((tz) => tz.text === timezone.selected)?.keyForList}
                showScrollIndicator
                shouldShowTooltips={false}
                ListItem={RadioListItem}
                shouldPreventActiveCellVirtualization
            />
        </ScreenWrapper>
    );
}

TimezoneSelectPage.displayName = 'TimezoneSelectPage';

export default withCurrentUserPersonalDetails(TimezoneSelectPage);
