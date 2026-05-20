import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {FlatList, View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import openWorkspaceRoomsPage from '@libs/actions/Policy/Room';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {isChatRoom, isPolicyExpenseChat} from '@libs/ReportUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import WorkspaceRoomsListItem from './WorkspaceRoomsListItem';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

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
    const isAdmin = isPolicyAdmin(policy);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    const [rooms] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
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
            return list.sort((a, b) => localeCompare(getReportName(a) ?? '', getReportName(b) ?? ''));
        },
    });

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
                        onPress={() => {}}
                        icon={icons.Plus}
                        text={translate('common.create')}
                    />
                </HeaderWithBackButton>

                <View style={[styles.flexRow, styles.ph5, styles.pv2, styles.alignItemsCenter]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, {flex: 3}]}>
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter, {width: variables.avatarSizeNormal}]}>
                            <Icon
                                src={icons.FallbackAvatar}
                                width={variables.iconSizeSmall}
                                height={variables.iconSizeSmall}
                                fill={theme.icon}
                            />
                        </View>
                        <Text style={[styles.textMicroSupporting, styles.ml3]}>{translate('common.name')}</Text>
                    </View>
                    <View style={{flex: 2}}>
                        <Text style={[styles.textMicroSupporting]}>{translate('common.createdBy')}</Text>
                    </View>
                    <View style={[styles.flex1]}>
                        <Text style={[styles.textMicroSupporting]}>{translate('common.members')}</Text>
                    </View>
                </View>

                <FlatList
                    data={rooms ?? []}
                    keyExtractor={(report) => report.reportID}
                    renderItem={({item}) => (
                        <WorkspaceRoomsListItem
                            report={item}
                            onPress={() => {
                                const targetRoute = isAdmin ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(item.reportID) : ROUTES.REPORT_WITH_ID.getRoute(item.reportID);
                                Navigation.navigate(targetRoute);
                            }}
                        />
                    )}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
