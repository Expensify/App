import React, {useMemo} from 'react';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import MoneyReportHeaderContent from './MoneyReportHeaderContent';
import type {MoneyReportHeaderOnyxProps, MoneyReportHeaderProps} from './types';

function MoneyReportHeader(props: MoneyReportHeaderProps) {
    const requestParentReportAction = useMemo(() => {
        if (!props.reportActions || !props.transactionThreadReport?.parentReportActionID) {
            return null;
        }
        return props.reportActions.find((action) => action.reportActionID === props.transactionThreadReport?.parentReportActionID);
    }, [props.reportActions, props.transactionThreadReport?.parentReportActionID]);

    return (
        <MoneyReportHeaderContent
            {...props}
            requestParentReportAction={requestParentReportAction}
        />
    );
}

MoneyReportHeader.displayName = 'MoneyReportHeader';

export default withOnyx<MoneyReportHeaderProps, MoneyReportHeaderOnyxProps>({
    transactionThreadReport: {
        key: ({transactionThreadReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
    },
})(MoneyReportHeader);
