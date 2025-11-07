import React from 'react';
import {View} from 'react-native';
import useIsInFocusMode from '@hooks/useIsInFocusMode';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useIsReportUnread from './hooks/useIsReportUnread';
import useOptionAlternateText from './hooks/useOptionAlternateText';
import useOptionName from './hooks/useOptionName';
import OptionRowAlternateText from './OptionRowAlternateText';
import OptionRowFreeTrial from './OptionRowFreeTrial';
import OptionRowLHNAvatars from './OptionRowLHNAvatars';
import OptionRowLHNDataBody from './OptionRowLHNDataBody';
import OptionRowLHNDataHoverable from './OptionRowLHNDataHoverable';
import OptionRowLHNDisplayNames from './OptionRowLHNDisplayNames';
import OptionRowLHNWrapper from './OptionRowLHNWrapper';

function OptionRowLHNData({reportID, onSelectRow}: {reportID: string; onSelectRow: (reportID: string) => void}) {
    const isInFocusMode = useIsInFocusMode();

    const reportName = useOptionName(reportID);
    const isUnread = useIsReportUnread(reportID);
    const alternateText = useOptionAlternateText(reportID);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];

    return (
        <OptionRowLHNWrapper
            reportID={reportID}
            onSelectRow={onSelectRow}
        >
            <OptionRowLHNDataHoverable
                reportID={reportID}
                isOptionFocused={false}
                reportName={reportName}
                isUnread={isUnread}
                alternateText={alternateText}
                onSelectRow={onSelectRow}
            >
                <OptionRowLHNDataBody>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <OptionRowLHNAvatars
                            reportID={reportID}
                            isHovered={false}
                            isFocused={false}
                        />
                        <View style={contentContainerStyles}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                <OptionRowLHNDisplayNames
                                    reportID={reportID}
                                    isFocused={false}
                                />
                                <OptionRowFreeTrial reportID={reportID} />
                                <OptionRowAlternateText
                                    isFocused={false}
                                    text={alternateText}
                                />
                            </View>
                        </View>
                    </View>
                </OptionRowLHNDataBody>
            </OptionRowLHNDataHoverable>
        </OptionRowLHNWrapper>
    );
}

export default OptionRowLHNData;
