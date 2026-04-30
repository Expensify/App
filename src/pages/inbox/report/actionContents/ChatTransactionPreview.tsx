import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUReportIDFromReportActionPreview, isSplitBillAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {createTransactionThreadReport} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type ChatTransactionPreviewProps = {
    /** All the data of the action, used for showing context menu and deriving the IOU report */
    action: OnyxTypes.ReportAction;

    /** The ID of the current report where the preview is rendered */
    reportID: string | undefined;

    /** ID of the original report from which the given report action was first created */
    originalReportID: string;

    /** The ID of the associated chat report, used when navigating to split bill details */
    chatReportID: string | undefined;

    /** The IOU report linked to this transaction, used when creating a transaction thread on demand */
    iouReport: OnyxEntry<OnyxTypes.Report>;

    /** Whether the preview should navigate to the split bill details screen on press */
    shouldShowSplitPreview: boolean;

    /** Whether the context menu should be shown on press */
    shouldDisplayContextMenu: boolean;

    /** The ID of the transaction to preview */
    transactionID: string | undefined;
};

function ChatTransactionPreview({action, reportID, originalReportID, chatReportID, iouReport, shouldShowSplitPreview, shouldDisplayContextMenu, transactionID}: ChatTransactionPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const personalDetail = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, 1, undefined, undefined);

    return (
        <View style={[styles.mt1, styles.w100]}>
            <TransactionPreview
                iouReportID={getIOUReportIDFromReportActionPreview(action)}
                chatReportID={reportID}
                reportID={reportID}
                action={action}
                shouldDisplayContextMenu={shouldDisplayContextMenu}
                isBillSplit={isSplitBillAction(action)}
                transactionID={transactionID}
                containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle, styles.mt1]}
                transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width}
                onPreviewPressed={() => {
                    if (shouldShowSplitPreview) {
                        Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(chatReportID, action.reportActionID, Navigation.getReportRHPActiveRoute()));
                        return;
                    }

                    // If no childReportID exists, create transaction thread on-demand
                    if (!action.childReportID) {
                        const createdTransactionThreadReport = createTransactionThreadReport(introSelected, personalDetail.email ?? '', personalDetail.accountID, betas, iouReport, action);
                        if (createdTransactionThreadReport?.reportID) {
                            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(createdTransactionThreadReport.reportID, undefined, undefined, Navigation.getActiveRoute()));
                            return;
                        }
                        return;
                    }

                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(action.childReportID, undefined, undefined, Navigation.getActiveRoute()));
                }}
                isTrackExpense={isTrackExpenseAction(action)}
                originalReportID={originalReportID}
            />
        </View>
    );
}

export default ChatTransactionPreview;
