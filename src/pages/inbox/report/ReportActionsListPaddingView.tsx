import {canShowReportRecipientLocalTimeSelector} from '@selectors/Report';
import React from 'react';
import {View} from 'react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import useShouldShowComposerForActiveEditDraft from './useShouldShowComposerForActiveEditDraft';

type ReportActionsListPaddingViewProps = ChildrenProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
    /** Whether the report is archived */
    isReportArchived: boolean;
};

function ReportActionsListPaddingView({report, isReportArchived, children}: ReportActionsListPaddingViewProps) {
    const styles = useThemeStyles();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [canShowReportRecipientLocalTime = false] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: canShowReportRecipientLocalTimeSelector(report, currentUserAccountID)}, [
        report,
        currentUserAccountID,
    ]);
    const reportActionsListFSClass = FS.getChatFSClass(report);

    const shouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft();
    const hideComposer = !canUserPerformWriteAction(report, isReportArchived) && !shouldShowComposerForActiveEditDraft;

    return (
        <View
            style={[styles.flex1, !canShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}
            fsClass={reportActionsListFSClass}
        >
            {children}
        </View>
    );
}

export default ReportActionsListPaddingView;
