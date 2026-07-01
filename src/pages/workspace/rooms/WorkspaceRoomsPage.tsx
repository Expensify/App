import {useFocusEffect} from '@react-navigation/native';
import {policyChatRoomsSelector} from '@selectors/Report';
import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import WorkspaceRoomsTable from '@components/Tables/WorkspaceRoomsTable';
import type {WorkspaceRoomRowData} from '@components/Tables/WorkspaceRoomsTable';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {openPolicyRoomsPage} from '@libs/actions/Policy/Room';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const headerIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const illustrations = useMemoizedLazyIllustrations(['Hashtag']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const isAdmin = isPolicyAdmin(policy);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    const reportAttributes = useReportAttributes();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const personalDetails = usePersonalDetails();

    const [policyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports: OnyxCollection<Report>) => policyChatRoomsSelector(policyID, reportNameValuePairs)(reports),
    });

    // The newly created room reportID is stored in Onyx right before navigating back here so its row can play the highlight animation.
    // It is cleared by the create page once the navigation transition ends (see WorkspaceNewRoomPage), so the animation doesn't replay on a later visit.
    const [roomIDToHighlight] = useOnyx(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE);
    const highlightedReportID = roomIDToHighlight ?? undefined;

    const rooms: WorkspaceRoomRowData[] = (policyReports ?? []).map((report) => ({
        keyForList: report.reportID,
        reportID: report.reportID,
        name: getReportName(report, reportAttributes),
        memberCount: getParticipantsAccountIDsForDisplay(report, true, false, false, undefined, personalDetails).length,
        action: () => {
            const targetRoute = isAdmin ? createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS.getRoute(report.reportID)) : ROUTES.REPORT_WITH_ID.getRoute(report.reportID);
            Navigation.navigate(targetRoute);
        },
    }));

    useFocusEffect(() => {
        openPolicyRoomsPage(policyID);
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
                    {!shouldUseNarrowLayout && (
                        <Button
                            success
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                            icon={headerIcons.Plus}
                            text={translate('common.create')}
                        />
                    )}
                </HeaderWithBackButton>

                {shouldUseNarrowLayout && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <Button
                            success
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                            icon={headerIcons.Plus}
                            text={translate('common.create')}
                            style={styles.w100}
                        />
                    </View>
                )}

                <WorkspaceRoomsTable
                    rooms={rooms}
                    highlightedReportID={highlightedReportID}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
