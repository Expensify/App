import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOptimisticNextStep from '@hooks/useOptimisticNextStep';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {buildNextStepMessage} from '@libs/NextStepUtils';
import Parser from '@libs/Parser';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {getReportType} from '@selectors/Report';
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
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [reportType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: getReportType});

    const showNextStepBar = !!optimisticNextStep && 'messageKey' in optimisticNextStep;
    const showNextStepSkeleton = !optimisticNextStep && !!isLoadingInitialReportActions && !isOffline;

    if (showNextStepBar) {
        return (
            <MoneyReportHeaderHistoryButton
                message={Parser.htmlToText(buildNextStepMessage(optimisticNextStep, translate, dateFnsLocale, currentUserPersonalDetails.accountID, formatPhoneNumber, reportType))}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.MONEY_REPORT_HEADER_NEXT_STEP}
            >
                <MoneyReportHeaderStatusBar
                    nextStep={optimisticNextStep}
                    reportType={reportType}
                />
            </MoneyReportHeaderHistoryButton>
        );
    }

    if (showNextStepSkeleton) {
        return <MoneyReportHeaderStatusBarSkeleton />;
    }

    return null;
}

export default MoneyReportHeaderNextStep;
