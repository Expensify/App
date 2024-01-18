import type {RouteProp} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import withReportAndReportActionOrNotFound from './home/report/withReportAndReportActionOrNotFound';
import type {WithReportAndReportActionOrNotFoundProps} from './home/report/withReportAndReportActionOrNotFound';

type FlagCommentPageWithOnyxProps = {
    /** All the report actions from the parent report */
    parentReportActions: OnyxEntry<OnyxTypes.ReportActions>;
};

type FlagCommentPageProps = WithReportAndReportActionOrNotFoundProps & FlagCommentPageWithOnyxProps;

type FlagCommentRouteProp = RouteProp<{params: {reportID: string; reportActionID: string}}>;

/**
 * Get the reportID for the associated chatReport
 */
function getReportID(route: FlagCommentRouteProp) {
    return route.params.reportID.toString();
}

function FlagCommentPage({parentReportActions, route, report, reportActions}: FlagCommentPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const severities = [
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

    const getActionToFlag = useCallback(() => {
        let reportAction = reportActions?.[`${route.params.reportActionID.toString()}`];

        // Handle threads if needed
        if (reportAction?.reportActionID === undefined) {
            reportAction = parentReportActions?.[report?.parentReportActionID ?? ''] ?? undefined;
        }

        return reportAction;
    }, [report, reportActions, route.params.reportActionID, parentReportActions]);

    const flagComment = (severity: ValueOf<typeof CONST.MODERATION>) => {
        let reportID: string | undefined = getReportID(route);
        const reportAction = getActionToFlag();
        const parentReportAction = parentReportActions?.[report?.parentReportActionID ?? ''] ?? undefined;

        // Handle threads if needed
        if (ReportUtils.isChatThread(report) && reportAction?.reportActionID === parentReportAction?.reportActionID) {
            reportID = ReportUtils.getParentReport(report)?.reportID;
        }

        if (reportAction && ReportUtils.canFlagReportAction(reportAction, reportID)) {
            Report.flagComment(reportID ?? '', reportAction, severity);
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
            {({safeAreaPaddingBottomStyle}) => {
                const actionToFlag = getActionToFlag();
                const shouldShowFlagComment = actionToFlag && ReportUtils.shouldShowFlagComment(actionToFlag, report);

                return (
                    <FullPageNotFoundView shouldShow={!shouldShowFlagComment}>
                        <HeaderWithBackButton
                            title={translate('reportActionContextMenu.flagAsOffensive')}
                            shouldNavigateToTopMostReport
                            onBackButtonPress={() => {
                                Navigation.goBack();
                                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report?.reportID ?? ''));
                            }}
                        />
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
                );
            }}
        </ScreenWrapper>
    );
}

FlagCommentPage.displayName = 'FlagCommentPage';

export default withReportAndReportActionOrNotFound(
    withOnyx<FlagCommentPageProps, FlagCommentPageWithOnyxProps>({
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID ?? report?.reportID}`,
            canEvict: false,
        },
    })(FlagCommentPage),
);
