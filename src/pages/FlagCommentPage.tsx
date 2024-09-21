import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {FlagCommentNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import withReportAndReportActionOrNotFound from './home/report/withReportAndReportActionOrNotFound';
import type {WithReportAndReportActionOrNotFoundProps} from './home/report/withReportAndReportActionOrNotFound';

type FlagCommentPageWithOnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;
    /** The parent report if the current report is a thread and it has a parent */
    parentReport: OnyxEntry<OnyxTypes.Report>;
    /** Array of report actions for this report */
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;
    /** The report action from the parent report */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;
};

type FlagCommentPageNavigationProps = StackScreenProps<FlagCommentNavigatorParamList, typeof SCREENS.FLAG_COMMENT_ROOT>;

type FlagCommentPageProps = WithReportAndReportActionOrNotFoundProps & FlagCommentPageNavigationProps & FlagCommentPageWithOnyxProps;

type Severity = ValueOf<typeof CONST.MODERATION>;

type SeverityItem = {
    severity: Severity;
    name: string;
    icon: React.FC<SvgProps>;
    description: string;
    furtherDetails: string;
    furtherDetailsIcon: React.FC<SvgProps>;
};

type SeverityItemList = SeverityItem[];

/**
 * Get the reportID for the associated chatReport
 */
function getReportID(route: FlagCommentPageNavigationProps['route']) {
    return route.params.reportID.toString();
}

function FlagCommentPage({parentReportAction, route, report, parentReport, reportActions}: FlagCommentPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const severities: SeverityItemList = [
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_SPAM,
            name: translate('moderation.spam'),
            icon: Expensicons.FlagLevelOne,
            description: translate('moderation.spamDescription'),
            furtherDetails: translate('moderation.levelOneResult'),
            furtherDetailsIcon: Expensicons.FlagLevelOne,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_INCONSIDERATE,
            name: translate('moderation.inconsiderate'),
            icon: Expensicons.FlagLevelOne,
            description: translate('moderation.inconsiderateDescription'),
            furtherDetails: translate('moderation.levelOneResult'),
            furtherDetailsIcon: Expensicons.FlagLevelOne,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_INTIMIDATION,
            name: translate('moderation.intimidation'),
            icon: Expensicons.FlagLevelTwo,
            description: translate('moderation.intimidationDescription'),
            furtherDetails: translate('moderation.levelTwoResult'),
            furtherDetailsIcon: Expensicons.FlagLevelTwo,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_BULLYING,
            name: translate('moderation.bullying'),
            icon: Expensicons.FlagLevelTwo,
            description: translate('moderation.bullyingDescription'),
            furtherDetails: translate('moderation.levelTwoResult'),
            furtherDetailsIcon: Expensicons.FlagLevelTwo,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_HARASSMENT,
            name: translate('moderation.harassment'),
            icon: Expensicons.FlagLevelThree,
            description: translate('moderation.harassmentDescription'),
            furtherDetails: translate('moderation.levelThreeResult'),
            furtherDetailsIcon: Expensicons.FlagLevelThree,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_ASSAULT,
            name: translate('moderation.assault'),
            icon: Expensicons.FlagLevelThree,
            description: translate('moderation.assaultDescription'),
            furtherDetails: translate('moderation.levelThreeResult'),
            furtherDetailsIcon: Expensicons.FlagLevelThree,
        },
    ];

    const getActionToFlag = useCallback((): OnyxTypes.ReportAction | null => {
        let reportAction = reportActions?.[`${route.params.reportActionID.toString()}`];

        // Handle threads if needed
        if (reportAction?.reportActionID === undefined && parentReportAction) {
            reportAction = parentReportAction;
        }

        if (!reportAction) {
            return null;
        }

        return reportAction;
    }, [reportActions, route.params.reportActionID, parentReportAction]);

    const flagComment = (severity: Severity) => {
        let reportID: string | undefined = getReportID(route);
        const reportAction = getActionToFlag();

        // Handle threads if needed
        if (ReportUtils.isChatThread(report) && reportAction?.reportActionID === parentReportAction?.reportActionID) {
            reportID = parentReport?.reportID;
        }

        if (reportAction && ReportUtils.canFlagReportAction(reportAction, reportID)) {
            Report.flagComment(reportID ?? '-1', reportAction, severity);
        }

        Navigation.dismissModal();
    };

    const severityMenuItems = severities.map((item) => (
        <MenuItem
            key={`${item.severity}`}
            shouldShowRightIcon
            title={item.name}
            description={item.description}
            onPress={Session.checkIfActionIsAllowed(() => flagComment(item.severity))}
            style={[styles.pt2, styles.pb4, styles.ph5, styles.flexRow]}
            furtherDetails={item.furtherDetails}
            furtherDetailsIcon={item.furtherDetailsIcon}
        />
    ));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={FlagCommentPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!ReportUtils.shouldShowFlagComment(getActionToFlag(), report)}>
                    <HeaderWithBackButton title={translate('reportActionContextMenu.flagAsOffensive')} />
                    <ScrollView
                        contentContainerStyle={safeAreaPaddingBottomStyle}
                        style={styles.settingsPageBackground}
                    >
                        <View style={styles.pageWrapper}>
                            <View style={styles.settingsPageBody}>
                                <Text style={styles.webViewStyles.baseFontStyle}>{translate('moderation.flagDescription')}</Text>
                            </View>
                        </View>
                        <Text style={[styles.ph5, styles.textLabelSupporting, styles.mb1]}>{translate('moderation.chooseAReason')}</Text>
                        {severityMenuItems}
                    </ScrollView>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

FlagCommentPage.displayName = 'FlagCommentPage';

export default withReportAndReportActionOrNotFound(FlagCommentPage);
