import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import {ParentNavigationSummaryParams} from '@src/languages/types';
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
    const {workspaceName, rootReportName} = parentNavigationSubtitleData;

    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            onPress={() => {
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentReportID));
            }}
            accessibilityLabel={translate('threads.parentNavigationSummary', {rootReportName, workspaceName})}
            role={CONST.ACCESSIBILITY_ROLE.LINK}
            style={pressableStyles}
        >
            <Text
                style={[styles.optionAlternateText]}
                numberOfLines={1}
            >
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{`${translate('threads.from')} `}</Text>
                <Text style={[styles.optionAlternateText, styles.textLabelSupporting, styles.link]}>{rootReportName}</Text>
                {Boolean(workspaceName) && <Text style={[styles.optionAlternateText, styles.textLabelSupporting]}>{` ${translate('threads.in')} ${workspaceName}`}</Text>}
            </Text>
        </PressableWithoutFeedback>
    );
}

ParentNavigationSubtitle.displayName = 'ParentNavigationSubtitle';
export default ParentNavigationSubtitle;
