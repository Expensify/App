import {useFocusEffect} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import openWorkspaceRoomsPage, {clearRoomIDToHighlightOnRoomsPage} from '@libs/actions/Policy/Room';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay, isChatRoom, isHiddenForCurrentUser, isPolicyExpenseChat} from '@libs/ReportUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import WorkspaceRoomsListItem from './WorkspaceRoomsListItem';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

type WorkspaceRoomsRow = {
    report: Report;
    roomName: string;
    ownerDetails: PersonalDetails | undefined;
    ownerDisplayName: string;
    memberCount: number;
};

function RowSeparator() {
    return <View style={{height: 8}} />;
}

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'FallbackAvatar']);
    const illustrations = useMemoizedLazyIllustrations(['Hashtag']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    const personalDetails = usePersonalDetails();
    const reportAttributes = useReportAttributes();
    const archivedReportsIdSet = useArchivedReportsIdSet();

    const flashListRef = useRef<FlashListRef<WorkspaceRoomsRow>>(null);
    const [roomIDToHighlight] = useOnyx(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE);
    const [highlightedRoomID, setHighlightedRoomID] = useState<string | null>(null);

    useEffect(() => {
        if (!roomIDToHighlight) {
            return;
        }
        setHighlightedRoomID(roomIDToHighlight);
        clearRoomIDToHighlightOnRoomsPage();
        const animationDuration =
            CONST.ANIMATED_HIGHLIGHT_ENTRY_DELAY +
            CONST.ANIMATED_HIGHLIGHT_ENTRY_DURATION +
            CONST.ANIMATED_HIGHLIGHT_START_DELAY +
            CONST.ANIMATED_HIGHLIGHT_START_DURATION +
            CONST.ANIMATED_HIGHLIGHT_END_DELAY +
            CONST.ANIMATED_HIGHLIGHT_END_DURATION;
        const timeout = setTimeout(() => setHighlightedRoomID(null), animationDuration);
        return () => clearTimeout(timeout);
    }, [roomIDToHighlight]);

    const [policyReports] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            selector: (allReports) => {
                const list: Report[] = [];
                for (const report of Object.values(allReports ?? {})) {
                    if (!report || report.policyID !== policyID) {
                        continue;
                    }
                    if (!isChatRoom(report) && !isPolicyExpenseChat(report)) {
                        continue;
                    }
                    list.push(report);
                }
                return list;
            },
        },
        [policyID],
    );

    const rows: WorkspaceRoomsRow[] = (policyReports ?? [])
        .filter((report) => !archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`) && !isHiddenForCurrentUser(report))
        .map((report) => {
            const ownerDetails = report.ownerAccountID ? (personalDetails?.[report.ownerAccountID] ?? undefined) : undefined;
            return {
                report,
                roomName: getReportName(report, reportAttributes),
                ownerDetails,
                ownerDisplayName: ownerDetails ? getDisplayNameOrDefault(ownerDetails) : '',
                memberCount: getParticipantsAccountIDsForDisplay(report, true, false, false, undefined, personalDetails).length,
            };
        })
        .sort((a, b) => localeCompare(a.roomName, b.roomName));

    useEffect(() => {
        if (!highlightedRoomID) {
            return;
        }
        const index = rows.findIndex((row) => row.report.reportID === highlightedRoomID);
        if (index < 0) {
            return;
        }
        flashListRef.current?.scrollToIndex({index, animated: false});
    }, [highlightedRoomID, rows]);

    useFocusEffect(() => {
        openWorkspaceRoomsPage(policyID);
    });

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.WORKSPACE_ROOMS_PAGE)}
        >
            <ScreenWrapper
                testID={WorkspaceRoomsPage.displayName}
                style={[styles.defaultModalContainer]}
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.rooms')}
                    icon={illustrations.Hashtag}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                    shouldDisplayHelpButton
                >
                    <Button
                        success
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                        icon={icons.Plus}
                        text={translate('common.create')}
                    />
                </HeaderWithBackButton>

                <View style={[styles.flex1, styles.pv3, styles.ph5]}>
                    <FlashList
                        ref={flashListRef}
                        data={rows}
                        extraData={highlightedRoomID}
                        keyExtractor={(row) => row.report.reportID}
                        ItemSeparatorComponent={RowSeparator}
                        ListHeaderComponent={
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.p4, styles.gap3]}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.flex3]}>
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter, {width: variables.avatarSizeNormal}]}>
                                        <Icon
                                            src={icons.FallbackAvatar}
                                            width={variables.iconSizeSmall}
                                            height={variables.iconSizeSmall}
                                            fill={theme.icon}
                                        />
                                    </View>
                                    <Text style={styles.textLabelSupporting}>{translate('common.name')}</Text>
                                </View>
                                <View style={styles.flex2}>
                                    <Text style={styles.textLabelSupporting}>{translate('common.createdBy')}</Text>
                                </View>
                                <View style={styles.flex1}>
                                    <Text style={styles.textLabelSupporting}>{translate('common.members')}</Text>
                                </View>
                            </View>
                        }
                        renderItem={({item}: ListRenderItemInfo<WorkspaceRoomsRow>) => (
                            <WorkspaceRoomsListItem
                                report={item.report}
                                roomName={item.roomName}
                                ownerDetails={item.ownerDetails}
                                ownerDisplayName={item.ownerDisplayName}
                                memberCount={item.memberCount}
                                shouldAnimateInHighlight={item.report.reportID === highlightedRoomID}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.report.reportID))}
                            />
                        )}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
