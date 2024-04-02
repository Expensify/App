import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {ParentNavigationSummaryParams} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** parent Report ID */
    parentReportID?: string;

    /** PressableWithoutFeedack additional styles */
    pressableStyles?: StyleProp<ViewStyle>;
};

function ParentNavigationSubtitle({parentNavigationSubtitleData, parentReportID = '', pressableStyles}: ParentNavigationSubtitleProps) {
    const styles = useThemeStyles();
    const {workspaceName, reportName} = parentNavigationSubtitleData;

    const {translate} = useLocalize();

    // We should not display the parent navigation subtitle if the user does not have access to the parent chat (the reportName is empty in this case)
    if (!reportName) {
        return;
    }

    return (
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentReportID));
            }}
            accessibilityLabel={translate('threads.parentNavigationSummary', {reportName, workspaceName})}
            role={CONST.ROLE.LINK}
            style={pressableStyles}
        >
            <Text
                style={[styles.optionAlternateText]}
                numberOfLines={1}
            >
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{`${translate('threads.from')} `}</Text>
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}>{reportName}</Text>
                {Boolean(workspaceName) && <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>}
            </Text>
        </PressableWithoutFeedback>
    );
}

ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
export default ParentNavigationSubtitle;
