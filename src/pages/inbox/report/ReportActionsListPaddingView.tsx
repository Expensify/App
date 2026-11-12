import FSClassView from '@components/FSClassView';

import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';

import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';

type ReportActionsListPaddingViewProps = ChildrenProps & {
    report: OnyxTypes.Report;
};

function ReportActionsListPaddingView({report, children}: ReportActionsListPaddingViewProps) {
    const styles = useThemeStyles();
    const reportActionsListFSClass = FS.getChatFSClass(report);

    return (
        <FSClassView
            style={styles.flex1}
            forwardedFSClass={reportActionsListFSClass}
        >
            {children}
        </FSClassView>
    );
}

export default ReportActionsListPaddingView;
