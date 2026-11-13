/**
 * Read-only trip summary that a trip opened from Spend shows instead of the trip room when the user isn't in the room.
 * The room would fail its access check for them, so the bookings come from a trip search for just that trip, with no chat and no actions.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Header from '@components/Header';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchResultsContext} from '@components/Search/SearchContext';

import useOnyx from '@hooks/useOnyx';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';
import useThemeStyles from '@hooks/useThemeStyles';

import {search} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type ReadOnlyTripSummaryPageProps = {
    /** The trip room the summary is for */
    reportID: string;
};

function ReadOnlyTripSummaryPage({reportID}: ReadOnlyTripSummaryPageProps) {
    const styles = useThemeStyles();
    const shouldReturnTripRooms = useShouldReturnTripRooms(CONST.SEARCH.DATA_TYPES.TRIP);
    const {currentSearchResults} = useSearchResultsContext();

    const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.TRIP} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}:${reportID}`);
    const tripRoomKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as const;
    const [tripSearch] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`, {
        selector: (snapshot: OnyxEntry<SearchResults>) => ({
            isLoading: !!snapshot?.search?.isLoading,
            hasLoaded: !!snapshot?.search,
            tripRoom: snapshot?.data?.[tripRoomKey],
            reportNameValuePairs: snapshot?.data?.[reportNameValuePairsKey],
        }),
    });

    // Rerun the trip search for just this trip, so the summary isn't left on the table's older results
    useEffect(() => {
        if (!queryJSON || !shouldReturnTripRooms) {
            return;
        }
        search({queryJSON, searchKey: undefined, isLoading: false, shouldReturnTripRooms});
    }, [queryJSON, shouldReturnTripRooms]);

    // The table's results show the trip right away while the fresh ones load, and cover a trip opened while offline
    const tripRoom = tripSearch?.tripRoom ?? currentSearchResults?.data?.[tripRoomKey];
    const reportNameValuePairs = tripSearch?.tripRoom ? tripSearch.reportNameValuePairs : currentSearchResults?.data?.[reportNameValuePairsKey];
    const isLoadingTrip = !tripRoom && (!tripSearch?.hasLoaded || tripSearch.isLoading);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID="ReadOnlyTripSummaryPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView shouldShow={!shouldReturnTripRooms || (!isLoadingTrip && tripRoom?.chatType !== CONST.REPORT.CHAT_TYPE.TRIP_ROOM)}>
                <Header>
                    <Header.BackButton onPress={() => Navigation.goBack()} />
                    <Header.Title title={Parser.htmlToText(tripRoom?.reportName ?? '')} />
                </Header>
                {isLoadingTrip ? (
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.pb5}>
                        <TripDetailsView
                            tripRoomReport={tripRoom}
                            reportNameValuePairs={reportNameValuePairs}
                            tripTransactions={[]}
                            shouldShowHorizontalRule={false}
                            isReadOnly
                        />
                    </ScrollView>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default ReadOnlyTripSummaryPage;
