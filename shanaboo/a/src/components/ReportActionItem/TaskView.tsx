import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {Str} from 'expensify-common';
import ReportActionItemContent from '@components/ReportActionItemContent';
import RenderHTML from '@components/RenderHTML';
import useThemeStyles from '@hooks/useThemeStyles';
    const styles = useThemeStyles();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${taskReportID}`);

    const description = useMemo(() => {
        const rawDescription = report?.description?.trim() ?? '';
        // Ensure we don't truncate the description and properly handle HTML content
        return Str.htmlDecode(rawDescription);
    }, [report?.description]);

    const isTaskCompleted = useMemo(() => report?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED, [report?.stateNum]);
