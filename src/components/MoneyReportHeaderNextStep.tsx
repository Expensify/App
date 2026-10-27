import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';
import useOptimisticNextStep from '@hooks/useOptimisticNextStep';

import CONST from '@src/CONST';

import React from 'react';

import MoneyReportHeaderHistoryButton from './MoneyReportHeaderHistoryButton';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';

type MoneyReportHeaderNextStepProps = {
    reportID: string | undefined;
};

/**
 * Renders the next step status bar or a skeleton loader.
 */
function MoneyReportHeaderNextStep({reportID}: MoneyReportHeaderNextStepProps) {
    const {isOffline} = useNetwork();
    const isLoadingInitialReportActions = useIsReportLoadPending(reportID);
    const optimisticNextStep = useOptimisticNextStep(reportID);

    const showNextStepBar = !!optimisticNextStep && 'messageKey' in optimisticNextStep;
    const showNextStepSkeleton = !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;

    if (showNextStepBar) {
        return (
            <MoneyReportHeaderHistoryButton sentryLabel={CONST.SENTRY_LABEL.REPORT.MONEY_REPORT_HEADER_NEXT_STEP}>
                <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />
            </MoneyReportHeaderHistoryButton>
        );
    }

    if (showNextStepSkeleton) {
        return <MoneyReportHeaderStatusBarSkeleton />;
    }

    return null;
}

export default MoneyReportHeaderNextStep;
