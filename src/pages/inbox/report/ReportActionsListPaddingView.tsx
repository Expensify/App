import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';
import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import {View} from 'react-native';

import useShouldShowComposerForActiveEditDraft from './useShouldShowComposerForActiveEditDraft';

type ReportActionsListPaddingViewProps = ChildrenProps & {
    report: OnyxTypes.Report;
    isReportArchived: boolean;
};

function ReportActionsListPaddingView({report, isReportArchived, children}: ReportActionsListPaddingViewProps) {
    const styles = useThemeStyles();
    const canShowRecipientLocalTime = useReportRecipientLocalTime({report});
    const reportActionsListFSClass = FS.getChatFSClass(report);

    const shouldShowComposerForActiveEditDraft = useShouldShowComposerForActiveEditDraft();
    const hideComposer = !canUserPerformWriteAction(report, isReportArchived) && !shouldShowComposerForActiveEditDraft;

    return (
        <View
            style={[styles.flex1, !canShowRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}
            fsClass={reportActionsListFSClass}
        >
            {children}
        </View>
    );
}

export default ReportActionsListPaddingView;
