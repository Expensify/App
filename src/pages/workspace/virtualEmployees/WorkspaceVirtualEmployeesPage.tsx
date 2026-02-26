import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openWorkspaceVirtualEmployeesPage} from '@libs/actions/VirtualEmployee';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyAdmin as isPolicyAdminUtils} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {VirtualEmployee} from '@src/types/onyx/VirtualEmployee';

type WorkspaceVirtualEmployeesPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.VIRTUAL_EMPLOYEES>;

function WorkspaceVirtualEmployeesPage({route}: WorkspaceVirtualEmployeesPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [virtualEmployeesCollection] = useOnyx(`${ONYXKEYS.COLLECTION.VIRTUAL_EMPLOYEES}${policyID}`);

    const isPolicyAdmin = isPolicyAdminUtils(policy);

    // Reload data each time the screen comes into focus (e.g. after creating/editing a VA)
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

    const getStatusColor = useCallback(
        (status: VirtualEmployee['status']): string => {
            switch (status) {
                case 'active':
                    return theme.success;
                case 'paused':
                    return theme.warning;
                case 'deleted':
                    return theme.danger;
                default:
                    return theme.icon;
            }
        },
        [theme],
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
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.p5]}>
                    <Text style={[styles.textHeadlineH2, styles.mb2, styles.textAlignCenter]}>{translate('workspace.virtualEmployees.emptyStateTitle')}</Text>
                    <Text style={[styles.textSupporting, styles.mb6, styles.textAlignCenter]}>{translate('workspace.virtualEmployees.emptyStateDescription')}</Text>
                    <Button
                        success
                        text={translate('workspace.virtualEmployees.addNew')}
                        onPress={navigateToCreate}
                        isDisabled={isOffline}
                    />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.pb4}>
                    {virtualEmployees.map((ve) => (
                        <OfflineWithFeedback
                            key={ve.id}
                            pendingAction={ve.pendingAction}
                            errors={ve.errors}
                        >
                            <Button
                                onPress={() => navigateToEdit(ve.id)}
                                style={[styles.mh5, styles.mb3, styles.p3]}
                            >
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.w100]}>
                                    <View style={styles.flex1}>
                                        <Text style={[styles.textStrong, styles.mb1]}>{ve.displayName}</Text>
                                        <Text style={[styles.textSupporting, styles.textMicro]}>{getCapabilitySummary(ve)}</Text>
                                    </View>
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: getStatusColor(ve.status),
                                            marginLeft: 8,
                                        }}
                                    />
                                </View>
                            </Button>
                        </OfflineWithFeedback>
                    ))}
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

WorkspaceVirtualEmployeesPage.displayName = 'WorkspaceVirtualEmployeesPage';

export default WorkspaceVirtualEmployeesPage;
