import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {isConnectionInProgress} from '@libs/actions/connections';
import {getPolicyBrickRoadIndicatorStatus, getUberConnectionErrorDirectlyFromPolicy, isMergeHRCompleteSetupNeededSelector, shouldShowEmployeeListError} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasReimbursementAccountErrorsSelector} from '@src/selectors/ReimbursementAccount';
import type {Policy, PolicyConnectionSyncProgress} from '@src/types/onyx';
import type {CardFeedErrors} from '@src/types/onyx/DerivedValues';

type WorkspaceRowBrickRoadIndicatorProps = {
    /** ID of the policy the row represents */
    policyID: string;
};

const createCardFeedErrorsSelector = (workspaceAccountID: number) => (cardFeedErrors: OnyxEntry<CardFeedErrors>) =>
    !!cardFeedErrors?.shouldShowRbrForWorkspaceAccountID?.[workspaceAccountID];

const createPolicyErrorsSelector = (connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>) => (policy: OnyxEntry<Policy>) =>
    getUberConnectionErrorDirectlyFromPolicy(policy) ||
    shouldShowEmployeeListError(policy) ||
    getPolicyBrickRoadIndicatorStatus(policy, isConnectionInProgress(connectionSyncProgress, policy)) === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;

/**
 * Error indicator of a workspaces list row. All of its subscriptions are narrow (booleans or a single
 * small entry), so a policy write re-evaluates only this row's selectors and re-renders at most this
 * one component instead of committing the whole workspaces list page.
 */
function WorkspaceRowBrickRoadIndicator({policyID}: WorkspaceRowBrickRoadIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [hasReimbursementAccountErrors] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: hasReimbursementAccountErrorsSelector});
    const [hasCardFeedErrors] = useOnyx(ONYXKEYS.DERIVED.CARD_FEED_ERRORS, {selector: createCardFeedErrorsSelector(workspaceAccountID)}, [workspaceAccountID]);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const [hasPolicyErrors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: createPolicyErrorsSelector(connectionSyncProgress)}, [connectionSyncProgress]);
    const [isHRCompleteSetupNeeded] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: isMergeHRCompleteSetupNeededSelector});

    // All of the error sources resolve to ERROR or undefined; the HR setup check is the only INFO source
    // and every error takes precedence over it.
    const hasError = !!hasReimbursementAccountErrors || !!hasCardFeedErrors || !!hasPolicyErrors;

    if (!hasError && !isHRCompleteSetupNeeded) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            <Icon
                src={icons.DotIndicator}
                fill={hasError ? theme.danger : theme.iconSuccessFill}
            />
        </View>
    );
}

export default WorkspaceRowBrickRoadIndicator;
