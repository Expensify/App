import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useDynamicForwardPath from '@hooks/useDynamicForwardPath';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useReturnToOriginReport from '@hooks/useReturnToOriginReport';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isCompletedTaskReport} from '@libs/ReportUtils';

import {getAccessiblePolicies} from '@userActions/Policy/Policy';
import {completeTask} from '@userActions/Task';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useCallback} from 'react';

import VerifyAccountPageBase from './VerifyAccountPageBase';

type DynamicVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT>;

function DynamicVerifyAccountPage({route}: DynamicVerifyAccountPageProps) {
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    let forwardPath = useDynamicForwardPath(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path);
    const isJoinWorkspaceTask = route.params?.isJoinWorkspaceTask === 'true';
    const returnToOriginReport = useReturnToOriginReport();
    const {
        taskReport: validateEmailTaskReport,
        taskParentReport: validateEmailTaskParentReport,
        parentReportAction: validateEmailTaskParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VALIDATE_EMAIL);

    const handleJoinWorkspaceValidationSuccess = useCallback(() => {
        completeTask(
            validateEmailTaskReport,
            validateEmailTaskParentReport?.hasOutstandingChildTask ?? false,
            false,
            validateEmailTaskParentReportAction,
            undefined,
            undefined,
            true,
            true,
            CONST.ACCOUNT_ID.CONCIERGE,
        );
        getAccessiblePolicies();
    }, [validateEmailTaskParentReport?.hasOutstandingChildTask, validateEmailTaskParentReportAction, validateEmailTaskReport]);
    const isValidateEmailTaskCompleted = isCompletedTaskReport(validateEmailTaskReport);

    if (backPath === ROUTES.SETTINGS_WALLET) {
        forwardPath = ROUTES.SETTINGS_ENABLE_PAYMENTS.getRoute();
    }

    if (isJoinWorkspaceTask && !isValidateEmailTaskCompleted) {
        forwardPath = ROUTES.ONBOARDING_WORKSPACES.getRoute(backPath, true, true);
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={backPath}
            navigateForwardTo={forwardPath}
            handleClose={isJoinWorkspaceTask ? returnToOriginReport : undefined}
            onValidationSuccess={isJoinWorkspaceTask && !isValidateEmailTaskCompleted ? handleJoinWorkspaceValidationSuccess : undefined}
            shouldShowCloseButton={isJoinWorkspaceTask}
        />
    );
}

export default DynamicVerifyAccountPage;
