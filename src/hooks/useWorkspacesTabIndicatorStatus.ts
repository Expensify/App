import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {isConnectionInProgress} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {shouldShowCustomUnitsError, shouldShowEmployeeListError, shouldShowPolicyError, shouldShowSyncError} from '@libs/PolicyUtils';
import {hasSubscriptionGreenDotInfo, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useTheme from './useTheme';

type WorkspacesTabIndicatorStatus = ValueOf<typeof CONST.INDICATOR_STATUS>;

type WorkspacesTabIndicatorStatusResult = {
    indicatorColor: string;
    status: ValueOf<typeof CONST.INDICATOR_STATUS> | undefined;
    policyIDWithErrors: string | undefined;
};

function useWorkspacesTabIndicatorStatus(): WorkspacesTabIndicatorStatusResult {
    const theme = useTheme();
    const [allConnectionSyncProgresses] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    const cleanPolicies = useMemo(() => Object.fromEntries(Object.entries(policies ?? {}).filter(([, policy]) => policy?.id)), [policies]);

    const policyErrors = {
        [CONST.INDICATOR_STATUS.HAS_POLICY_ERRORS]: Object.values(cleanPolicies).find(shouldShowPolicyError),
        [CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR]: Object.values(cleanPolicies).find(shouldShowCustomUnitsError),
        [CONST.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR]: Object.values(cleanPolicies).find(shouldShowEmployeeListError),
        [CONST.INDICATOR_STATUS.HAS_SYNC_ERRORS]: Object.values(cleanPolicies).find((cleanPolicy) =>
            shouldShowSyncError(cleanPolicy, isConnectionInProgress(allConnectionSyncProgresses?.[`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${cleanPolicy?.id}`], cleanPolicy)),
        ),
        [CONST.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR]: Object.values(cleanPolicies).find(shouldShowQBOReimbursableExportDestinationAccountError),
    };

    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    const errorChecking: Partial<Record<WorkspacesTabIndicatorStatus, boolean>> = {
        ...(Object.fromEntries(Object.entries(policyErrors).map(([error, policy]) => [error, !!policy])) as Record<keyof typeof policyErrors, boolean>),
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS]: hasSubscriptionRedDotError(),
    };

    const infoChecking: Partial<Record<WorkspacesTabIndicatorStatus, boolean>> = {
        [CONST.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO]: hasSubscriptionGreenDotInfo(),
    };

    const [error] = Object.entries(errorChecking).find(([, value]) => value) ?? [];
    const [info] = Object.entries(infoChecking).find(([, value]) => value) ?? [];

    const status = (error ?? info) as WorkspacesTabIndicatorStatus | undefined;
    const policyIDWithErrors = Object.values(policyErrors).find(Boolean)?.id;
    const indicatorColor = error ? theme.danger : theme.success;

    return {indicatorColor, status, policyIDWithErrors};
}

export default useWorkspacesTabIndicatorStatus;
