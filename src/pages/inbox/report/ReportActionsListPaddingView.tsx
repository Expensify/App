import useThemeStyles from '@hooks/useThemeStyles';

import FS from '@libs/Fullstory';

import type * as OnyxTypes from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';
import {View} from 'react-native';

type ReportActionsListPaddingViewProps = ChildrenProps & {
    report: OnyxTypes.Report;
};

function ReportActionsListPaddingView({report, children}: ReportActionsListPaddingViewProps) {
    const styles = useThemeStyles();
    const reportActionsListFSClass = FS.getChatFSClass(report);

    return (
        <View
            style={styles.flex1}
            fsClass={reportActionsListFSClass}
        >
            {children}
        </View>
    );
}

export default ReportActionsListPaddingView;
