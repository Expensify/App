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
import Provider from './Provider';
import Wrapper from './Wrapper';

type Props = {
    reportID: string;
};

function OptionRow({reportID}: Props) {
    const isInFocusMode = useIsInFocusMode();
    const reportName = useOptionName(reportID);
    const isUnread = useIsReportUnread(reportID);
    const alternateText = useOptionAlternateText(reportID);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const contentContainerStyles = isInFocusMode ? [styles.flex1, styles.flexRow, styles.overflowHidden, StyleUtils.getCompactContentContainerStyles()] : [styles.flex1];

    return (
        <Provider reportID={reportID}>
            <Wrapper>
                <Hoverable
                    reportName={reportName}
                    isUnread={isUnread}
                    alternateText={alternateText}
                >
                    <Body>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Avatars />
                            <View style={contentContainerStyles}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mw100, styles.overflowHidden]}>
                                    <DisplayNames />
                                    <FreeTrial />
                                    <AlternateText text={alternateText} />
                                </View>
                            </View>
                        </View>
                    </Body>
                </Hoverable>
            </Wrapper>
        </Provider>
    );
}

export default OptionRow;
