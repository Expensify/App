import {usePersonalDetails} from '@components/OnyxListItemProvider';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUReportIDFromReportActionPreview, isSplitBillAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';

import {createTransactionThreadReport} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {fullPolicySnapshotLastModifiedSelector} from '@selectors/Policy';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

type ChatTransactionPreviewProps = {
    /** All the data of the action, used for showing context menu and deriving the IOU report */
    action: OnyxTypes.ReportAction;

    /** The ID of the current report where the preview is rendered */
    reportID: string | undefined;

    /** The chat report that owns the transaction */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** The IOU report linked to this transaction, used when creating a transaction thread on demand */
    iouReport: OnyxEntry<OnyxTypes.Report>;

    /** Whether the preview should navigate to the split bill details screen on press */
    shouldShowSplitPreview: boolean;

    transactionID: string | undefined;
};

function ChatTransactionPreview({action, reportID, chatReport, iouReport, shouldShowSplitPreview, transactionID}: ChatTransactionPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const personalDetail = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();

    const createAndOpenTransactionThread = async () => {
        const [introSelected, conciergeReportID, onboarding, fullPolicySnapshotData] = await Onyx.multiGet([
            ONYXKEYS.NVP_INTRO_SELECTED,
            ONYXKEYS.CONCIERGE_REPORT_ID,
            ONYXKEYS.NVP_ONBOARDING,
            `${ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT}${getNonEmptyStringOnyxID(iouReport?.policyID)}`,
        ]);
        const conciergeChat = await Onyx.get(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
        const {isSelfTourViewed, hasCompletedGuidedSetupFlow} = guidedSetupAndTourStatusSelector(onboarding);
        const createdTransactionThreadReport = createTransactionThreadReport({
            introSelected,
            conciergeChat,
            isSelfTourViewed,
            hasCompletedGuidedSetupFlow,
            currentUserLogin: personalDetail.email ?? '',
            currentUserAccountID: personalDetail.accountID,
            iouReport,
            iouReportAction: action,
            personalDetails,
            fullPolicySnapshotLastModified: fullPolicySnapshotLastModifiedSelector(fullPolicySnapshotData),
        });
        if (!createdTransactionThreadReport?.reportID) {
            return;
        }
        Navigation.navigate(getReportRouteForCurrentContext({reportID: createdTransactionThreadReport.reportID}));
    };

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, 1, undefined, undefined);

    return (
        <View style={[styles.mt1, styles.w100]}>
            <TransactionPreview
                iouReportID={getIOUReportIDFromReportActionPreview(action)}
                chatReport={chatReport}
                reportID={reportID}
                action={action}
                isBillSplit={isSplitBillAction(action)}
                transactionID={transactionID}
                containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle, styles.mt1]}
                transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width}
                onPreviewPressed={() => {
                    if (shouldShowSplitPreview) {
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SPLIT_BILL_DETAILS.getRoute(action.reportActionID)));
                        return;
                    }

                    // If no childReportID exists, create transaction thread on-demand
                    if (!action.childReportID) {
                        createAndOpenTransactionThread();
                        return;
                    }

                    Navigation.navigate(getReportRouteForCurrentContext({reportID: action.childReportID}));
                }}
                isTrackExpense={isTrackExpenseAction(action)}
            />
        </View>
    );
}

export default ChatTransactionPreview;
