import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {openWorkspaceVirtualEmployeesPage} from '@libs/actions/VirtualEmployee';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyAdmin as isPolicyAdminUtils} from '@libs/PolicyUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {VirtualEmployee} from '@src/types/onyx/VirtualEmployee';

type WorkspaceVirtualEmployeesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VIRTUAL_EMPLOYEES>;

function WorkspaceVirtualEmployeesPage({route}: WorkspaceVirtualEmployeesPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const illustrations = useMemoizedLazyIllustrations(['ConciergeBot'] as const);

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [virtualEmployeesCollection] = useOnyx(`${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`);

    const isPolicyAdmin = isPolicyAdminUtils(policy);

    useFocusEffect(
        useCallback(() => {
            openWorkspaceVirtualEmployeesPage(policyID);
        }, [policyID]),
    );

    const virtualEmployees = useMemo(() => {
        if (!virtualEmployeesCollection) {
            return [];
        }
        return Object.values(virtualEmployeesCollection).filter((ve): ve is VirtualEmployee => !!ve && ve.status !== 'deleted');
    }, [virtualEmployeesCollection]);

    const navigateToCreate = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_VIRTUAL_EMPLOYEES_EDIT.getRoute(policyID, 'new'));
    }, [policyID]);

    const navigateToEdit = useCallback(
        (virtualEmployeeID: string) => {
            Navigation.navigate(ROUTES.WORKSPACE_VIRTUAL_EMPLOYEES_EDIT.getRoute(policyID, virtualEmployeeID));
        },
        [policyID],
    );

    const getCapabilitySummary = useCallback(
        (ve: VirtualEmployee) => {
            const count = ve.capabilities?.length ?? 0;
            if (count === 0) {
                return translate('workspace.virtualEmployees.noCapabilities');
            }
            return translate('workspace.virtualEmployees.capabilityCount', {count});
        },
        [translate],
    );

    if (!isPolicyAdmin) {
        return (
            <ScreenWrapper testID="WorkspaceVirtualEmployeesPage">
                <HeaderWithBackButton
                    title={translate('workspace.virtualEmployees.title')}
                    onBackButtonPress={Navigation.goBack}
                />
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.p5]}>
                    <Text style={styles.textLabel}>{translate('workspace.common.notAuthorized')}</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper testID="WorkspaceVirtualEmployeesPage">
            <HeaderWithBackButton
                icon={illustrations.ConciergeBot}
                shouldUseHeadlineHeader
                title={translate('workspace.virtualEmployees.title')}
                onBackButtonPress={Navigation.goBack}
            >
                <Button
                    success
                    text={translate('workspace.virtualEmployees.addNew')}
                    onPress={navigateToCreate}
                    isDisabled={isOffline}
                    style={styles.mr3}
                    small
                />
            </HeaderWithBackButton>

            {virtualEmployees.length === 0 ? (
                <EmptyStateComponent
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ILLUSTRATION}
                    headerMedia={illustrations.ConciergeBot}
                    title={translate('workspace.virtualEmployees.emptyStateTitle')}
                    subtitle={translate('workspace.virtualEmployees.emptyStateDescription')}
                    headerStyles={[
                        styles.overflowHidden,
                        StyleUtils.getBackgroundColorStyle(colors.green400),
                        StyleUtils.getHeight(variables.sectionIllustrationHeight),
                    ]}
                    headerContentStyles={[styles.alignItemsCenter, styles.justifyContentCenter, {width: 120, height: 120}]}
                    buttons={[
                        {
                            success: true,
                            buttonText: translate('workspace.virtualEmployees.addNew'),
                            buttonAction: navigateToCreate,
                            isDisabled: isOffline,
                        },
                    ]}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.pb4}>
                    <View style={styles.mt3}>
                        {virtualEmployees.map((ve) => (
                            <OfflineWithFeedback
                                key={ve.id}
                                pendingAction={ve.pendingAction}
                                errors={ve.errors}
                            >
                                <MenuItem
                                    icon={getDefaultAvatarURL({accountID: ve.accountID})}
                                    iconType={CONST.ICON_TYPE_AVATAR}
                                    avatarID={ve.accountID}
                                    title={ve.displayName}
                                    description={getCapabilitySummary(ve)}
                                    onPress={() => navigateToEdit(ve.id)}
                                    shouldShowRightIcon
                                    badgeText={ve.status !== 'active' ? translate('workspace.virtualEmployees.statusPaused') : undefined}
                                />
                            </OfflineWithFeedback>
                        ))}
                    </View>
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

WorkspaceVirtualEmployeesPage.displayName = 'WorkspaceVirtualEmployeesPage';

export default WorkspaceVirtualEmployeesPage;
