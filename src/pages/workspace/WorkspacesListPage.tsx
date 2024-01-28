import React, {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PolicyMembers, Policy as PolicyType, ReimbursementAccount} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceItem = Required<Pick<MenuItemProps, 'title' | 'icon' | 'disabled'>> &
    Pick<MenuItemProps, 'brickRoadIndicator'> &
    Pick<OfflineWithFeedbackProps, 'errors' | 'pendingAction'> & {
        action: () => void;
        dismissError: () => void;
    };

type WorkspaceListPageOnyxProps = {
    /** The list of this user's policies */
    policies: OnyxCollection<PolicyType>;

    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** A collection of objects for all policies which key policy member objects by accountIDs */
    allPolicyMembers: OnyxCollection<PolicyMembers>;
};

type WorkspaceListPageProps = WithPolicyAndFullscreenLoadingProps & WorkspaceListPageOnyxProps;

const workspaceFeatures = [
    {
        icon: Illustrations.MoneyReceipts,
        translationKey: 'workspace.emptyWorkspace.features.trackAndCollect',
    },
    {
        icon: Illustrations.CreditCardsNew,
        translationKey: 'workspace.emptyWorkspace.features.companyCards',
    },
    {
        icon: Illustrations.MoneyWings,
        translationKey: 'workspace.emptyWorkspace.features.reimbursements',
    },
];

/**
 * Dismisses the errors on one item
 */
function dismissWorkspaceError(policyID: string, pendingAction: OnyxCommon.PendingAction) {
    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        Policy.clearDeleteWorkspaceError(policyID);
        return;
    }

    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Policy.removeWorkspace(policyID);
        return;
    }
    throw new Error('Not implemented');
}

function WorkspacesListPage({policies, allPolicyMembers, reimbursementAccount}: WorkspaceListPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    /**
     * Gets the menu item for each workspace
     */
    const getMenuItem = (item: WorkspaceItem, index: number) => (
        <OfflineWithFeedback
            key={`${item.title}_${index}`}
            pendingAction={item.pendingAction}
            errorRowStyles={styles.ph5}
            onClose={item.dismissError}
            errors={item.errors}
        >
            <MenuItem
                title={item.title}
                icon={item.icon}
                iconType={CONST.ICON_TYPE_WORKSPACE}
                onPress={item.action}
                iconFill={theme.textLight}
                shouldShowRightIcon
                fallbackIcon={Expensicons.FallbackWorkspaceAvatar}
                brickRoadIndicator={item.brickRoadIndicator}
                disabled={item.disabled}
            />
        </OfflineWithFeedback>
    );

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     */
    const workspaces: WorkspaceItem[] = useMemo(() => {
        const reimbursementAccountBrickRoadIndicator = reimbursementAccount?.errors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
        if (isEmptyObject(policies)) {
            return [];
        }
        return Object.values(policies)
            .filter((policy): policy is PolicyType => PolicyUtils.shouldShowPolicy(policy, !!isOffline))
            .map(
                (policy): WorkspaceItem => ({
                    title: policy.name,
                    icon: policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                    action: () => Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policy.id)),
                    brickRoadIndicator: reimbursementAccountBrickRoadIndicator ?? PolicyUtils.getPolicyBrickRoadIndicatorStatus(policy, allPolicyMembers),
                    pendingAction: policy.pendingAction,
                    errors: policy.errors,
                    dismissError: () => {
                        if (!policy.pendingAction) {
                            return;
                        }
                        dismissWorkspaceError(policy.id, policy.pendingAction);
                    },
                    disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                }),
            )
            .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    }, [reimbursementAccount?.errors, policies, isOffline, allPolicyMembers]);

    return (
        <IllustratedHeaderPageLayout
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.WORKSPACES].backgroundColor}
            illustration={LottieAnimations.WorkspacePlanet}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            title={translate('common.workspaces')}
            footer={
                <Button
                    accessibilityLabel={translate('workspace.new.newWorkspace')}
                    success
                    text={translate('workspace.new.newWorkspace')}
                    onPress={() => App.createWorkspaceWithPolicyDraftAndNavigateToIt()}
                />
            }
        >
            {isEmptyObject(workspaces) ? (
                <FeatureList
                    menuItems={workspaceFeatures}
                    headline="workspace.emptyWorkspace.title"
                    description="workspace.emptyWorkspace.subtitle"
                />
            ) : (
                workspaces.map((item, index) => getMenuItem(item, index))
            )}
        </IllustratedHeaderPageLayout>
    );
}

WorkspacesListPage.displayName = 'WorkspacesListPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceListPageProps, WorkspaceListPageOnyxProps>({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    })(WorkspacesListPage),
);
