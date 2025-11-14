import React from 'react';
import {View} from 'react-native';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

function OptionRowLHNWrapper({children, reportID, onSelectRow}: {children: React.ReactNode; reportID: string; onSelectRow: (reportID: string) => void}) {
    return (
        <OfflineWithFeedback>
            <EducationalTooltip onTooltipPress={() => onSelectRow(reportID)}>
                <View>{children}</View>
            </EducationalTooltip>
        </OfflineWithFeedback>
    );
}

export default OptionRowLHNWrapper;
