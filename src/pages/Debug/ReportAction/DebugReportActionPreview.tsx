import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import useOnyx from '@hooks/useOnyx';
import ReportActionItem from '@pages/home/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type DebugReportActionPreviewProps = {
    /** The report action to be previewed. */
    reportAction: OnyxEntry<ReportAction>;

    /** The report id to be previewed. */
    reportID: string;
};

function DebugReportActionPreview({reportAction, reportID}: DebugReportActionPreviewProps) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {selector: (wallet) => wallet?.tierName, canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    const personalDetails = usePersonalDetails();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID, canBeMissing: true});

    return (
        <ScrollView>
            <ReportActionItem
                allReports={allReports}
                policies={policies}
                action={reportAction ?? ({} as ReportAction)}
                report={report ?? ({} as Report)}
                reportActions={[]}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                index={0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
                userWallet={userWallet}
                isUserValidated={isUserValidated}
                personalDetails={personalDetails}
                userBillingFundID={userBillingFundID}
                currentUserAccountID={currentUserAccountID}
            />
        </ScrollView>
    );
}

DebugReportActionPreview.displayName = 'DebugReportActionPreview';

export default DebugReportActionPreview;
