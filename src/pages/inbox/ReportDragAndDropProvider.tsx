import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React from 'react';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function ReportDragAndDropProvider({children}: {children: ReactNode}) {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isEditingDisabled = !canUserPerformWriteAction(report, isReportArchived);

    return <DragAndDropProvider isDisabled={isEditingDisabled}>{children}</DragAndDropProvider>;
}

export default ReportDragAndDropProvider;
