import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';
import useNextStep from '@hooks/useNextStep';

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
    const isLoadingInitialReportActions = useIsReportLoadPending(reportID);
    const nextStep = useNextStep(reportID);

    const showNextStepBar = !!nextStep;
    const showNextStepSkeleton = !nextStep && !!isLoadingInitialReportActions && !isOffline;

    if (showNextStepBar) {
        return <MoneyReportHeaderStatusBar nextStep={nextStep} />;
    }

    if (showNextStepSkeleton) {
        return <MoneyReportHeaderStatusBarSkeleton />;
    }

    return null;
}

export default MoneyReportHeaderNextStep;
