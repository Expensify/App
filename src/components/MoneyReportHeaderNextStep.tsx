import React from 'react';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOptimisticNextStep from '@hooks/useOptimisticNextStep';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import ONYXKEYS from '@src/ONYXKEYS';
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
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;
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
