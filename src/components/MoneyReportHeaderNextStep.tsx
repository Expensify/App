import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';
import useOptimisticNextStep from '@hooks/useOptimisticNextStep';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import React from 'react';

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
    // Whether the report's initial actions are still loading, derived from the request queue (an in-flight
    // OpenReport for this report) rather than the stored report-metadata flag, so the queue stays the single
    // source of truth for load state.
    const isLoadingInitialReportActions = useIsReportLoadPending(reportID);
    const optimisticNextStep = useOptimisticNextStep(reportID);

    const showNextStepBar = !!optimisticNextStep && (('message' in optimisticNextStep && !!optimisticNextStep.message?.length) || 'messageKey' in optimisticNextStep);
    const showNextStepSkeleton = !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;

    if (showNextStepBar) {
        return <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />;
    }

    if (showNextStepSkeleton) {
        const nextStepSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'MoneyReportHeaderNextStep',
            isLoadingInitialReportActions: !!isLoadingInitialReportActions,
            isOffline,
            hasOptimisticNextStep: !!optimisticNextStep,
        };

        return <MoneyReportHeaderStatusBarSkeleton reasonAttributes={nextStepSkeletonReasonAttributes} />;
    }

    return null;
}

export default MoneyReportHeaderNextStep;
