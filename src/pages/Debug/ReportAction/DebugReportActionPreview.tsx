import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScrollView from '@components/ScrollView';
import useOnyx from '@hooks/useOnyx';
import ReportActionItem from '@pages/inbox/report/ReportActionItem';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type DebugReportActionPreviewProps = {
    /** The report action to be previewed. */
    reportAction: OnyxEntry<ReportAction>;

    /** The report id to be previewed. */
    reportID: string;
};

function DebugReportActionPreview({reportAction, reportID}: DebugReportActionPreviewProps) {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const personalDetails = usePersonalDetails();
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;

    return (
        <ScrollView>
            <ReportActionItem
                allReports={allReports}
                policies={policies}
                action={reportAction ?? ({} as ReportAction)}
                report={report ?? ({} as Report)}
                parentReportAction={undefined}
                displayAsGroup={false}
                isMostRecentIOUReportAction={false}
                shouldDisplayNewMarker={false}
                index={0}
                isFirstVisibleReportAction={false}
                shouldDisplayContextMenu={false}
                userWalletTierName={userWalletTierName}
                isUserValidated={isUserValidated}
                personalDetails={personalDetails}
                userBillingFundID={userBillingFundID}
                isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
            />
        </ScrollView>
    );
}

export default DebugReportActionPreview;
