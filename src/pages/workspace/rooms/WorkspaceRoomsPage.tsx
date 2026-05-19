import {useFocusEffect} from '@react-navigation/native';
import {policyChatRoomsSelector} from '@selectors/Report';
import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
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
import openWorkspaceRoomsPage from '@libs/actions/Policy/Room';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay, isHiddenForCurrentUser} from '@libs/ReportUtils';
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

/**
 * Row data for a single workspace room rendered in the list.
 */
type WorkspaceRoomsRow = {
    /** The underlying report representing the room. */
    report: Report;

    /** Resolved display name of the room. */
    roomName: string;

    /** Personal details of the room owner, if available. */
    ownerDetails: PersonalDetails | undefined;

    /** Display name for the room owner, or empty string when missing. */
    ownerDisplayName: string;

    /** Number of members shown next to the room. */
    memberCount: number;
};

function RowSeparator() {
    return <View style={{height: 8}} />;
}

function ListHeader() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    return (
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
    );
}

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const illustrations = useMemoizedLazyIllustrations(['Hashtag']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    const personalDetails = usePersonalDetails();
    const reportAttributes = useReportAttributes();
    const archivedReportsIdSet = useArchivedReportsIdSet();

    const [policyReports] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            selector: policyChatRoomsSelector(policyID),
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
                        isDisabled
                        onPress={() => {}}
                        icon={icons.Plus}
                        text={translate('common.create')}
                    />
                </HeaderWithBackButton>

                <View style={[styles.flex1, styles.pv3, styles.ph5]}>
                    <FlashList
                        data={rows}
                        keyExtractor={(row) => row.report.reportID}
                        ItemSeparatorComponent={RowSeparator}
                        ListHeaderComponent={ListHeader}
                        renderItem={({item}: ListRenderItemInfo<WorkspaceRoomsRow>) => (
                            <WorkspaceRoomsListItem
                                report={item.report}
                                roomName={item.roomName}
                                ownerDetails={item.ownerDetails}
                                ownerDisplayName={item.ownerDisplayName}
                                memberCount={item.memberCount}
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
