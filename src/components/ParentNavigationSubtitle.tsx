import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {ParentNavigationSummaryParams} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type ParentNavigationSubtitleProps = {
    parentNavigationSubtitleData: ParentNavigationSummaryParams;

    /** parent Report ID */
    parentReportID?: string;

    /** parent Report Action ID */
    parentReportActionID?: string;

    /** PressableWithoutFeedack additional styles */
    pressableStyles?: StyleProp<ViewStyle>;
};

function ParentNavigationSubtitle({parentNavigationSubtitleData, parentReportActionID, parentReportID = '', pressableStyles}: ParentNavigationSubtitleProps) {
    const styles = useThemeStyles();
    const {workspaceName, reportName} = parentNavigationSubtitleData;
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            onPress={() => {
                const parentAction = ReportActionsUtils.getReportAction(parentReportID, parentReportActionID ?? '');
                const isVisibleAction = ReportActionsUtils.shouldReportActionBeVisible(parentAction, parentAction?.reportActionID ?? '');
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(parentReportID, isVisibleAction && !isOffline ? parentReportActionID : undefined));
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
