/**
 * Read-only trip summary that a trip opened from Spend shows instead of the trip room when the user isn't in the room.
 * The room would fail its access check for them, so the bookings come from a trip search for just that trip, with no chat and no actions.
 */
import ActivityIndicator from '@components/ActivityIndicator';
import useAccountIcons from '@components/Avatar/connected/useAccountIcons';
import useReportWorkspaceIcon from '@components/Avatar/connected/useReportWorkspaceIcon';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Header from '@components/Header';
import HeaderTitle from '@components/HeaderTitle';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import TripDetailsView from '@components/ReportActionItem/TripDetailsView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchResultsContext} from '@components/Search/SearchContext';
import useRHPWidth from '@components/WideRHPContextProvider/useRHPWidth';

import useHeaderAvatarSize from '@hooks/useHeaderAvatarSize';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';
import useThemeStyles from '@hooks/useThemeStyles';

import {search} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchTrip} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';

type ReadOnlyTripSummaryHeaderProps = {
    /** The trip room from the trip search */
    tripRoom: SearchTrip | undefined;
};

/** The trip room's header, built from the trip search because the user has no copy of the room: same avatar and lines, and only the workspace chat link to press */
function ReadOnlyTripSummaryHeader({tripRoom}: ReadOnlyTripSummaryHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const avatarSize = useHeaderAvatarSize();
    const route = useRoute();
    const [travelerIcon] = useAccountIcons([tripRoom?.travelerAccountID ?? CONST.DEFAULT_NUMBER_ID]);
    const workspaceIcon = useReportWorkspaceIcon(tripRoom);
    const travelerName = travelerIcon?.displayName;
    const title = Parser.htmlToText(tripRoom?.reportName ?? '');

    return (
        <Header>
            <Header.BackButton onPress={() => Navigation.goBack()} />
            {!!tripRoom && !!travelerIcon && (
                <SubscriptAvatar
                    primaryAvatar={travelerIcon}
                    secondaryAvatar={workspaceIcon}
                    size={avatarSize}
                    containerStyle={styles.mr3}
                />
            )}
            <HeaderTitle
                dialogLabel={title}
                style={styles.pr3}
            >
                <HeaderTitle.Text numberOfLines={1}>{title}</HeaderTitle.Text>
                {!!tripRoom && (
                    // The room's parent is the traveler's workspace chat, so the subtitle names it and links to the trip's preview there, as the room's header does
                    <ParentNavigationSubtitle
                        parentNavigationSubtitleData={{
                            reportName: travelerName ? translate('workspace.common.policyExpenseChatName', travelerName) : undefined,
                            workspaceName: workspaceIcon.name,
                        }}
                        reportID={tripRoom.reportID}
                        parentReportID={tripRoom.parentReportID}
                        parentReportActionID={tripRoom.parentReportActionID}
                        pressableStyles={[styles.alignSelfStart, styles.mw100]}
                        // Same as the room's header, so the chat opens on top in Spend instead of sending the user to Inbox
                        openParentReportInCurrentTab={route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT}
                    />
                )}
            </HeaderTitle>
        </Header>
    );
}

type ReadOnlyTripSummaryPageProps = {
    /** The trip room the summary is for */
    reportID: string;
};

function ReadOnlyTripSummaryPage({reportID}: ReadOnlyTripSummaryPageProps) {
    const styles = useThemeStyles();
    const shouldReturnTripRooms = useShouldReturnTripRooms(CONST.SEARCH.DATA_TYPES.TRIP);
    const {currentSearchResults} = useSearchResultsContext();
    // It stands in for the trip room, which opens wide from Spend, so it takes the same panel
    useRHPWidth('wide');

    const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.TRIP} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}:${reportID}`);
    const tripRoomKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    const reportNameValuePairsKey = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}` as const;
    const [tripSearch] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`, {
        selector: (snapshot: OnyxEntry<SearchResults>) => ({
            hasLoaded: snapshot?.search?.state === CONST.SEARCH.SNAPSHOT_STATE.LOADED,
            hasFailed: !!snapshot?.search?.responseJsonCode || !isEmptyObject(snapshot?.errors),
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

    // Until this trip search succeeds, its snapshot may be from an older visit, so the table's row comes first
    const hasTripSearchSucceeded = !!tripSearch?.hasLoaded && !tripSearch.hasFailed;
    const shouldUseTripSearch = hasTripSearchSucceeded || !currentSearchResults?.data?.[tripRoomKey];
    const tripRoom = shouldUseTripSearch ? tripSearch?.tripRoom : currentSearchResults?.data?.[tripRoomKey];
    const reportNameValuePairs = shouldUseTripSearch ? tripSearch?.reportNameValuePairs : currentSearchResults?.data?.[reportNameValuePairsKey];
    const isLoadingTrip = !tripRoom && !tripSearch?.hasLoaded;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID="ReadOnlyTripSummaryPage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <FullPageNotFoundView shouldShow={!shouldReturnTripRooms || (!isLoadingTrip && tripRoom?.chatType !== CONST.REPORT.CHAT_TYPE.TRIP_ROOM)}>
                <ReadOnlyTripSummaryHeader tripRoom={tripRoom} />
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
