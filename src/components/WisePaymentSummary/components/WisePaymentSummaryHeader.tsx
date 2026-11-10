import ReportAvatar from '@components/Avatar/connected/ReportAvatar';
import StatusBadge from '@components/StatusBadge';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportName} from '@libs/ReportNameUtils';
import {getReportStatusColorStyle, getReportStatusTooltipTranslation, getReportStatusTranslation} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAttributesDerivedValue} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {reportNameSelector} from '@selectors/ReportAttributes';
import React from 'react';
import {View} from 'react-native';

type WisePaymentSummaryHeaderProps = {
    reportID: string | undefined;

    /** Used instead of the report in Onyx when the caller already has it */
    report?: Report;
};

function WisePaymentSummaryHeader({reportID, report: reportFromProps}: WisePaymentSummaryHeaderProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [onyxReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const report = reportFromProps ?? onyxReport;
    const selectReportName = (attributes: OnyxEntry<ReportAttributesDerivedValue>) => reportNameSelector(attributes, reportID);
    const [derivedReportName] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {selector: selectReportName});

    const statusParams = {stateNum: report?.stateNum, statusNum: report?.statusNum, translate};
    const reportStatus = getReportStatusTranslation(statusParams);
    const reportStatusColorStyle = getReportStatusColorStyle(theme, report?.stateNum, report?.statusNum);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <ReportAvatar
                reportID={reportID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
            />
            <View style={[styles.flex1, styles.gap1]}>
                <Text
                    style={styles.headerText}
                    numberOfLines={1}
                >
                    {getReportName(report, derivedReportName)}
                </Text>
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    {!!reportStatus && (
                        <StatusBadge
                            text={reportStatus}
                            backgroundColor={reportStatusColorStyle?.backgroundColor}
                            textColor={reportStatusColorStyle?.textColor}
                            badgeStyles={styles.mr1}
                            tooltipText={getReportStatusTooltipTranslation(statusParams)}
                        />
                    )}
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{translate('iou.expenseCount', {count: report?.transactionCount ?? 0})}</Text>
                </View>
            </View>
        </View>
    );
}

export default WisePaymentSummaryHeader;
