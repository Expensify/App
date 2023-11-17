import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import policyMemberPropType from '@pages/policyMemberPropType';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as App from '@userActions/App';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

const propTypes = {
    /** The list of this user's policies */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The ID of the policy */
            ID: PropTypes.string,

            /** The name of the policy */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,

            /** The user's role in the policy */
            role: PropTypes.string,

            /** The current action that is waiting to happen on the policy */
            pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        }),
    ),

    /** Bank account attached to free plan */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes,

    /** A collection of objects for all policies which key policy member objects by accountIDs */
    allPolicyMembers: PropTypes.objectOf(PropTypes.objectOf(policyMemberPropType)),

    /** The user's wallet account */
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        currentBalance: PropTypes.number,
    }),
};

const defaultProps = {
    policies: {},
    allPolicyMembers: {},
    reimbursementAccount: {},
    userWallet: {
        currentBalance: 0,
    },
};

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
 *
 * @param {string} policyID
 * @param {string} pendingAction
 */
function dismissWorkspaceError(policyID, pendingAction) {
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

function WorkspacesListPage({policies, allPolicyMembers, reimbursementAccount, userWallet}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {canUseWallet} = usePermissions();

    /**
     * @param {Boolean} isPaymentItem whether the item being rendered is the payments menu item
     * @returns {Number} the user wallet balance
     */
    function getWalletBalance(isPaymentItem) {
        return isPaymentItem && canUseWallet ? CurrencyUtils.convertToDisplayString(userWallet.currentBalance) : undefined;
    }

    /**
     * Gets the menu item for each workspace
     *
     * @param {Object} item
     * @param {Number} index
     * @returns {JSX}
     */
    function getMenuItem(item, index) {
        const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
        const isPaymentItem = item.translationKey === 'common.wallet';

        return (
            <OfflineWithFeedback
                key={`${keyTitle}_${index}`}
                pendingAction={item.pendingAction}
                errorRowStyles={styles.ph5}
                onClose={item.dismissError}
                errors={item.errors}
            >
                <MenuItem
                    title={keyTitle}
                    icon={item.icon}
                    iconType={CONST.ICON_TYPE_WORKSPACE}
                    onPress={item.action}
                    iconStyles={item.iconStyles}
                    iconFill={item.iconFill}
                    shouldShowRightIcon
                    badgeText={getWalletBalance(isPaymentItem)}
                    fallbackIcon={item.fallbackIcon}
                    brickRoadIndicator={item.brickRoadIndicator}
                    disabled={item.disabled}
                />
            </OfflineWithFeedback>
        );
    }

    /**
     * Add free policies (workspaces) to the list of menu items and returns the list of menu items
     * @returns {Array} the menu item list
     */
    const workspaces = useMemo(() => {
        const reimbursementAccountBrickRoadIndicator = !_.isEmpty(reimbursementAccount.errors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        return _.chain(policies)
            .filter((policy) => PolicyUtils.shouldShowPolicy(policy, isOffline))
            .map((policy) => ({
                title: policy.name,
                icon: policy.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                iconType: policy.avatar ? CONST.ICON_TYPE_AVATAR : CONST.ICON_TYPE_ICON,
                action: () => Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policy.id)),
                iconFill: theme.textLight,
                fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                brickRoadIndicator: reimbursementAccountBrickRoadIndicator || PolicyUtils.getPolicyBrickRoadIndicatorStatus(policy, allPolicyMembers),
                pendingAction: policy.pendingAction,
                errors: policy.errors,
                dismissError: () => dismissWorkspaceError(policy.id, policy.pendingAction),
                disabled: policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            }))
            .sortBy((policy) => policy.title.toLowerCase())
            .value();
    }, [reimbursementAccount.errors, policies, isOffline, theme.textLight, allPolicyMembers]);

    return (
        <IllustratedHeaderPageLayout
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.WORKSPACES]}
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
            {_.isEmpty(workspaces) ? (
                <FeatureList
                    menuItems={workspaceFeatures}
                    headline="workspace.emptyWorkspace.title"
                    description="workspace.emptyWorkspace.subtitle"
                />
            ) : (
                _.map(workspaces, (item, index) => getMenuItem(item, index))
            )}
        </IllustratedHeaderPageLayout>
    );
}

WorkspacesListPage.propTypes = propTypes;
WorkspacesListPage.defaultProps = defaultProps;
WorkspacesListPage.displayName = 'WorkspacesListPage';

export default compose(
    withPolicyAndFullscreenLoading,
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(WorkspacesListPage);
