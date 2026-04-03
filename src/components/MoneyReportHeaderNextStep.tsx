import React from 'react';
import useMoneyReportHeaderStatusBar from '@hooks/useMoneyReportHeaderStatusBar';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOptimisticNextStep from '@hooks/useOptimisticNextStep';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isInvoiceReport as isInvoiceReportUtil} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import MoneyReportHeaderStatusBar from './MoneyReportHeaderStatusBar';
import MoneyReportHeaderStatusBarSkeleton from './MoneyReportHeaderStatusBarSkeleton';

type MoneyReportHeaderNextStepProps = {
    reportID: string | undefined;
};

function MoneyReportHeaderNextStep({reportID}: MoneyReportHeaderNextStepProps) {
    const {isOffline} = useNetwork();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;

    const {shouldShowStatusBar} = useMoneyReportHeaderStatusBar(reportID, moneyRequestReport?.chatReportID);
    const optimisticNextStep = useOptimisticNextStep(reportID);

    const policyType = policy?.type;
    const isFromPaidPolicy = policyType === CONST.POLICY.TYPE.TEAM || policyType === CONST.POLICY.TYPE.CORPORATE;
    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const shouldShowNextStep = isFromPaidPolicy && !isInvoiceReport && !shouldShowStatusBar;

    const showNextStepBar = shouldShowNextStep && !!optimisticNextStep && (('message' in optimisticNextStep && !!optimisticNextStep.message?.length) || 'messageKey' in optimisticNextStep);
    const showNextStepSkeleton = shouldShowNextStep && !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;

    if (!showNextStepBar && !showNextStepSkeleton) {
        return null;
    }

    if (showNextStepBar) {
        return <MoneyReportHeaderStatusBar nextStep={optimisticNextStep} />;
    }

    if (showNextStepSkeleton) {
        const nextStepSkeletonReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'MoneyReportHeaderNextStep',
            shouldShowNextStep,
            isLoadingInitialReportActions: !!isLoadingInitialReportActions,
            isOffline,
            hasOptimisticNextStep: !!optimisticNextStep,
        };

        return <MoneyReportHeaderStatusBarSkeleton reasonAttributes={nextStepSkeletonReasonAttributes} />;
    }
}

export default MoneyReportHeaderNextStep;
