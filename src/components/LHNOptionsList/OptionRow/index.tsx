import React from 'react';
import {View} from 'react-native';
import useIsInFocusMode from '@hooks/useIsInFocusMode';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import AlternateText from './AlternateText';
import Avatars from './Avatars';
import Body from './Body';
import DisplayNames from './DisplayNames';
import FreeTrial from './FreeTrial';
import useIsReportUnread from './hooks/useIsReportUnread';
import useOptionAlternateText from './hooks/useOptionAlternateText';
import useOptionName from './hooks/useOptionName';
import Hoverable from './Hoverable';
import Wrapper from './Wrapper';

type Props = {
    reportID: string;
    onSelectRow: (reportID: string) => void;
};

function OptionRow({reportID, onSelectRow}: Props) {
    const isInFocusMode = useIsInFocusMode();

    const reportName = useOptionName(reportID);
    const isUnread = useIsReportUnread(reportID);
    const alternateText = useOptionAlternateText(reportID);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];

    return (
        <Wrapper
            reportID={reportID}
            onSelectRow={onSelectRow}
        >
            <Hoverable
                reportID={reportID}
                isOptionFocused={false}
                reportName={reportName}
                isUnread={isUnread}
                alternateText={alternateText}
                onSelectRow={onSelectRow}
            >
                <Body>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Avatars
                            reportID={reportID}
                            isHovered={false}
                            isFocused={false}
                        />
                        <View style={contentContainerStyles}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                <DisplayNames
                                    reportID={reportID}
                                    isFocused={false}
                                />
                                <FreeTrial reportID={reportID} />
                                <AlternateText
                                    isFocused={false}
                                    text={alternateText}
                                />
                            </View>
                        </View>
                    </View>
                </Body>
            </Hoverable>
        </Wrapper>
    );
}

export default OptionRow;
