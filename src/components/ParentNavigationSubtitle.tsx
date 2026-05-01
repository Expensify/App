import React from 'react';
import type {ColorValue, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ParentNavigationSummaryParams} from '@src/languages/params';
import StatusBadge from './StatusBadge';
import Text from './Text';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** The status text of the expense report */
    statusText?: string;

    /** The style of the text */
    textStyles?: StyleProp<TextStyle>;

    /** The background color for the status text */
    statusTextBackgroundColor?: ColorValue;

    /** The text color for the status text */
    statusTextColor?: ColorValue;

    /** The style of the status text container */
    statusTextContainerStyles?: StyleProp<ViewStyle>;

    /** The number of lines for the subtitle */
    subtitleNumberOfLines?: number;

    /** AccountID of the human agent assisting Concierge, gates the "- assisted by [...]" suffix */
    humanAgentAccountID?: number;

    /** Display name of the human agent; falls back to a generic label when missing */
    humanAgentName?: string;
};

function ParentNavigationSubtitle({
    parentNavigationSubtitleData,
    statusText,
    textStyles,
    statusTextBackgroundColor,
    statusTextColor,
    statusTextContainerStyles,
    subtitleNumberOfLines = 1,
    humanAgentAccountID,
    humanAgentName,
}: ParentNavigationSubtitleProps) {
    const styles = useThemeStyles();

    const {workspaceName, reportName} = parentNavigationSubtitleData;
    const {translate} = useLocalize();

    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
            {!!statusText && (
                <StatusBadge
                    text={statusText}
                    backgroundColor={statusTextBackgroundColor}
                    textColor={statusTextColor}
                    badgeStyles={[styles.mr1, statusTextContainerStyles]}
                />
            )}
            <Text
                style={[styles.optionAlternateText, styles.textLabelSupporting, styles.flexShrink1, styles.mnw0, textStyles]}
                numberOfLines={subtitleNumberOfLines}
            >
                {!!reportName && (
                    <>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>{`${translate('threads.from')} `}</Text>
                        <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>{reportName}</Text>
                    </>
                )}
                {!!humanAgentAccountID && (
                    <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>
                        {` - ${translate('reportAction.assistedBy', humanAgentName ?? translate('reportAction.humanSupportAgent'))}`}
                    </Text>
                )}
                {!!workspaceName && workspaceName !== reportName && (
                    <Text style={[styles.optionAlternateText, styles.textLabelSupporting, textStyles]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>
                )}
            </Text>
        </View>
    );
}

export default ParentNavigationSubtitle;
