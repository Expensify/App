import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import {hasDynamicExternalWorkflow} from '@libs/PolicyUtils';
import {getOriginalMessage, hasPendingDEWApprove, hasPendingDEWSubmit, isActionOfType, isMarkAsClosedAction} from '@libs/ReportActionsUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type ApprovalFlowContentProps = {
    action: OnyxTypes.ReportAction;
    policy: OnyxEntry<OnyxTypes.Policy>;
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;
    childReport: OnyxEntry<OnyxTypes.Report>;
    originalReport: OnyxEntry<OnyxTypes.Report>;
};

function isApprovalFlowAction(action: OnyxTypes.ReportAction): boolean {
    return (
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
        isMarkAsClosedAction(action) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.APPROVED) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.FORWARDED)
    );
}

function ApprovalFlowContent({action, policy, reportMetadata, childReport, originalReport}: ApprovalFlowContentProps) {
    const {translate} = useLocalize();
    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    const isPendingAdd = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) || isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) || isMarkAsClosedAction(action)) {
        const wasSubmittedViaHarvesting = !isMarkAsClosedAction(action) ? (getOriginalMessage(action)?.harvesting ?? false) : false;

        if (wasSubmittedViaHarvesting) {
            return (
                <ReportActionItemMessageWithExplain
                    message={translate('iou.automaticallySubmitted')}
                    action={action}
                    childReport={childReport}
                    originalReport={originalReport}
                />
            );
        }

        if (hasPendingDEWSubmit(reportMetadata, isDEWPolicy) && isPendingAdd) {
            return <ReportActionItemBasicMessage message={translate('iou.queuedToSubmitViaDEW')} />;
        }

        if (isDEWPolicy) {
            // Don't show a memo for DEW actions, it's shown in the Concierge action below
            return <ReportActionItemBasicMessage message={translate('iou.submitted')} />;
        }

        return <ReportActionItemBasicMessage message={translate('iou.submitted', getOriginalMessage(action)?.message)} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const wasAutoApproved = getOriginalMessage(action)?.automaticAction ?? false;

        if (wasAutoApproved) {
            return (
                <ReportActionItemMessageWithExplain
                    message={translate('iou.automaticallyApproved')}
                    action={action}
                    childReport={childReport}
                    originalReport={originalReport}
                />
            );
        }

        if (hasPendingDEWApprove(reportMetadata, isDEWPolicy) && isPendingAdd) {
            return <ReportActionItemBasicMessage message={translate('iou.queuedToApproveViaDEW')} />;
        }

        return <ReportActionItemBasicMessage message={translate('iou.approvedMessage')} />;
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const wasAutoForwarded = getOriginalMessage(action)?.automaticAction ?? false;

        if (wasAutoForwarded) {
            return (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyForwarded')}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        }

        return <ReportActionItemBasicMessage message={translate('iou.forwarded')} />;
    }

    return null;
}

ApprovalFlowContent.displayName = 'ApprovalFlowContent';

export default ApprovalFlowContent;
export {isApprovalFlowAction};
