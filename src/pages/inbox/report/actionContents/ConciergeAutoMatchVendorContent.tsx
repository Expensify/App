import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type ConciergeAutoMatchVendorContentProps = {
    action: ReportAction;
    originalReport: OnyxEntry<Report>;
};

function ConciergeAutoMatchVendorContent({action, originalReport}: ConciergeAutoMatchVendorContentProps) {
    const {translate} = useLocalize();
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action.childReportID)}`);

    const originalMessage = getOriginalMessage(action);
    const vendorName = originalMessage && typeof originalMessage === 'object' && 'vendorName' in originalMessage ? (originalMessage.vendorName ?? '') : '';
    const message = translate('iou.conciergeAutoMatchedVendor', {vendorName});

    return (
        <ReportActionItemMessageWithExplain
            message={message}
            action={action}
            childReport={childReport}
            originalReport={originalReport}
        />
    );
}

ConciergeAutoMatchVendorContent.displayName = 'ConciergeAutoMatchVendorContent';

export default ConciergeAutoMatchVendorContent;
