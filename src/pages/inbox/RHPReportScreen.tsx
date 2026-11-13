import {useSearchResultsContext} from '@components/Search/SearchContext';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RightModalNavigatorParamList} from '@libs/Navigation/types';
import {isReportParticipant} from '@libs/ReportUtils';
import {shouldShowReadOnlyTripSummary} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import ReadOnlyTripSummaryPage from './ReadOnlyTripSummaryPage';
import ReportScreen from './ReportScreen';

type PageProps = PlatformStackScreenProps<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

// When switching search reports using arrows SET_PARAMS action is performed, but it's necessary to remount the whole component after changing the reportID due to the hooks dependencies.
// It's suggested to refactor hooks in ReportScreen to remove this file and perform SET_PARAMS without the report screen remount.
export default function RHPReportScreen({route, navigation}: PageProps) {
    const reportID = route.params?.reportID;
    const {accountID} = useCurrentUserPersonalDetails();
    const {currentSearchResults} = useSearchResultsContext();
    const [isTripRoomParticipant = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {
        selector: (report: OnyxEntry<Report>) => isReportParticipant(accountID, report),
    });
    const searchTripRoom = currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    if (reportID && shouldShowReadOnlyTripSummary(searchTripRoom, isTripRoomParticipant, accountID)) {
        return (
            <ReadOnlyTripSummaryPage
                key={reportID}
                reportID={reportID}
            />
        );
    }

    return (
        <ReportScreen
            key={reportID}
            route={route}
            navigation={navigation}
        />
    );
}
