import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getOriginalMessage} from '@libs/ReportActionsUtils';

import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React from 'react';

type ConciergeAutoMatchVendorContentProps = {
    action: ReportAction;
    originalReport: OnyxEntry<Report>;
};

function ConciergeAutoMatchVendorContent({action, originalReport}: ConciergeAutoMatchVendorContentProps) {
    const {translate} = useLocalize();
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action.childReportID)}`);

    const originalMessage = getOriginalMessage(action);
    const rawVendorName = originalMessage && typeof originalMessage === 'object' && 'vendorName' in originalMessage ? (originalMessage.vendorName ?? '') : '';

    // vendorName is interpolated into an HTML translation rendered via RenderHTML, so encode it to prevent QBO vendor names containing HTML from being parsed as markup.
    const vendorName = Str.htmlEncode(rawVendorName);
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
