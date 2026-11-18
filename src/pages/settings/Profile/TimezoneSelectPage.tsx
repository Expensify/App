import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TimezoneSelectionList from '@components/TimezoneSelectionList';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import {updateSelectedTimezone} from '@userActions/PersonalDetails';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import type {ValueOf} from 'type-fest';

import React from 'react';

type TimezoneSelectPageProps = Pick<WithCurrentUserPersonalDetailsProps, 'currentUserPersonalDetails'>;

const getUserTimezone = (currentUserPersonalDetails: ValueOf<WithCurrentUserPersonalDetailsProps, 'currentUserPersonalDetails'>) =>
    currentUserPersonalDetails?.timezone ?? CONST.DEFAULT_TIME_ZONE;

function TimezoneSelectPage({currentUserPersonalDetails}: TimezoneSelectPageProps) {
    const {translate} = useLocalize();
    const timezone = getUserTimezone(currentUserPersonalDetails);

    const saveSelectedTimezone = (selectedTimezone: SelectedTimezone | undefined) => {
        if (!selectedTimezone) {
            Navigation.goBack(ROUTES.SETTINGS_TIMEZONE);
            return;
        }
        updateSelectedTimezone(selectedTimezone, currentUserPersonalDetails.accountID);
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="TimezoneSelectPage"
        >
            <HeaderWithBackButton
                title={translate('timezonePage.timezone')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_TIMEZONE)}
            />
            <TimezoneSelectionList
                savedTimezone={timezone.selected}
                onSave={saveSelectedTimezone}
                isDisabled={!!timezone.automatic}
            />
        </ScreenWrapper>
    );
}

export default withCurrentUserPersonalDetails(TimezoneSelectPage);
