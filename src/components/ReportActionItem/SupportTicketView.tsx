import Checkbox from '@components/Checkbox';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isResolvedSupportTicket} from '@libs/ReportUtils';

import {dismissFailedSupportTicket} from '@userActions/Report';

import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type SupportTicketViewProps = {
    report: OnyxEntry<Report>;
    action: OnyxEntry<ReportAction>;
};

function SupportTicketView({report, action}: SupportTicketViewProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isResolved = isResolvedSupportTicket(report, action);

    return (
        <OfflineWithFeedback
            shouldShowErrorMessages
            errors={report?.errorFields?.createReport}
            onClose={() => dismissFailedSupportTicket(report?.reportID ?? '', report?.parentReportID ?? '', report?.parentReportActionID ?? '')}
        >
            <View style={[styles.ph5, styles.pv3]}>
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <Tooltip text={translate('supportTicket.checkboxTooltip')}>
                        <View>
                            <Checkbox
                                isChecked={isResolved}
                                disabled
                                onPress={() => {}}
                                accessibilityLabel={translate('supportTicket.checkboxTooltip')}
                            />
                        </View>
                    </Tooltip>
                    <Text style={[styles.ml3, styles.flex1]}>{translate('supportTicket.description')}</Text>
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

export default SupportTicketView;
