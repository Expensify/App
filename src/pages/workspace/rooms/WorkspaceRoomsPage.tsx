import {useFocusEffect} from '@react-navigation/native';
import {policyChatRoomsSelector} from '@selectors/Report';
import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
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
import type {Report} from '@src/types/onyx';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

type RoomListItem = ListItem & {
    reportID: string;
};

function RoomRightElement({report}: {report: Report}) {
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails();
    const ownerDetails = report.ownerAccountID ? (personalDetails?.[report.ownerAccountID] ?? undefined) : undefined;
    const ownerDisplayName = ownerDetails ? getDisplayNameOrDefault(ownerDetails) : '';
    const memberCount = getParticipantsAccountIDsForDisplay(report, true, false, false, undefined, personalDetails).length;

    return (
        <>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.flex2]}>
                {!!ownerDetails && (
                    <>
                        <Avatar
                            source={ownerDetails.avatar}
                            avatarID={ownerDetails.accountID}
                            name={ownerDisplayName}
                            type={CONST.ICON_TYPE_AVATAR}
                            size={CONST.AVATAR_SIZE.SMALLER}
                        />
                        <Text
                            numberOfLines={1}
                            style={styles.flexShrink1}
                        >
                            {ownerDisplayName}
                        </Text>
                    </>
                )}
            </View>
            <View style={styles.flex1}>
                <Text>{memberCount}</Text>
            </View>
        </>
    );
}

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const headerIcons = useMemoizedLazyExpensifyIcons(['Plus', 'Profile']);
    const illustrations = useMemoizedLazyIllustrations(['Hashtag']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    const reportAttributes = useReportAttributes();
    const archivedReportsIdSet = useArchivedReportsIdSet();

    const [policyReports] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            selector: policyChatRoomsSelector(policyID),
        },
        [policyID],
    );

    const data: RoomListItem[] = (policyReports ?? [])
        .filter((report) => !archivedReportsIdSet.has(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`) && !isHiddenForCurrentUser(report))
        .map((report) => ({
            keyForList: report.reportID,
            text: getReportName(report, reportAttributes),
            reportID: report.reportID,
            rightElement: <RoomRightElement report={report} />,
        }))
        .sort((a, b) => localeCompare(a.text ?? '', b.text ?? ''));

    useFocusEffect(() => {
        openWorkspaceRoomsPage(policyID);
    });

    const customListHeader = (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mh5, styles.ph4, styles.pv3]}>
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getAvatarWidthStyle(CONST.AVATAR_SIZE.DEFAULT)]}>
                <Icon
                    src={headerIcons.Profile}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                />
            </View>
            <View style={styles.flex1}>
                <Text style={styles.textLabelSupporting}>{translate('common.name')}</Text>
            </View>
            <View style={styles.flex2}>
                <Text style={styles.textLabelSupporting}>{translate('common.createdBy')}</Text>
            </View>
            <View style={[styles.flex1, styles.mr7]}>
                <Text style={styles.textLabelSupporting}>{translate('common.members')}</Text>
            </View>
        </View>
    );

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
                        icon={headerIcons.Plus}
                        text={translate('common.create')}
                    />
                </HeaderWithBackButton>

                <SelectionList<RoomListItem>
                    data={data}
                    ListItem={TableListItem}
                    onSelectRow={(item) => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(item.reportID))}
                    customListHeader={customListHeader}
                    shouldHeaderBeInsideList
                    shouldShowRightCaret
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
