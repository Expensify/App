import React, {useCallback} from 'react';
import _ from 'underscore';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import reportPropTypes from './reportPropTypes';
import reportActionPropTypes from './home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import Text from '../components/Text';
import * as Expensicons from '../components/Icon/Expensicons';
import MenuItem from '../components/MenuItem';
import * as Report from '../libs/actions/Report';
import CONST from '../CONST';
import * as ReportUtils from '../libs/ReportUtils';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import * as Session from '../libs/actions/Session';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import withReportAndReportActionOrNotFound from './home/report/withReportAndReportActionOrNotFound';

const propTypes = {
    /** Array of report actions for this report */
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** The active report */
    report: reportPropTypes,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/:reportActionID */
            reportID: PropTypes.string,

            /** ReportActionID passed via route r/:reportID/:reportActionID */
            reportActionID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reportActions: {},
    report: {},
};

/**
 * Get the reportID for the associated chatReport
 *
 * @param {Object} route
 * @param {Object} route.params
 * @param {String} route.params.reportID
 * @returns {String}
 */
function getReportID(route) {
    return route.params.reportID.toString();
}

function FlagCommentPage(props) {
    const severities = [
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_SPAM,
            name: props.translate('moderation.spam'),
            icon: Expensicons.FlagLevelOne,
            description: props.translate('moderation.spamDescription'),
            furtherDetails: props.translate('moderation.levelOneResult'),
            furtherDetailsIcon: Expensicons.FlagLevelOne,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_INCONSIDERATE,
            name: props.translate('moderation.inconsiderate'),
            icon: Expensicons.FlagLevelOne,
            description: props.translate('moderation.inconsiderateDescription'),
            furtherDetails: props.translate('moderation.levelOneResult'),
            furtherDetailsIcon: Expensicons.FlagLevelOne,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_INTIMIDATION,
            name: props.translate('moderation.intimidation'),
            icon: Expensicons.FlagLevelTwo,
            description: props.translate('moderation.intimidationDescription'),
            furtherDetails: props.translate('moderation.levelTwoResult'),
            furtherDetailsIcon: Expensicons.FlagLevelTwo,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_BULLYING,
            name: props.translate('moderation.bullying'),
            icon: Expensicons.FlagLevelTwo,
            description: props.translate('moderation.bullyingDescription'),
            furtherDetails: props.translate('moderation.levelTwoResult'),
            furtherDetailsIcon: Expensicons.FlagLevelTwo,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_HARASSMENT,
            name: props.translate('moderation.harassment'),
            icon: Expensicons.FlagLevelThree,
            description: props.translate('moderation.harassmentDescription'),
            furtherDetails: props.translate('moderation.levelThreeResult'),
            furtherDetailsIcon: Expensicons.FlagLevelThree,
        },
        {
            severity: CONST.MODERATION.FLAG_SEVERITY_ASSAULT,
            name: props.translate('moderation.assault'),
            icon: Expensicons.FlagLevelThree,
            description: props.translate('moderation.assaultDescription'),
            furtherDetails: props.translate('moderation.levelThreeResult'),
            furtherDetailsIcon: Expensicons.FlagLevelThree,
        },
    ];

    const getActionToFlag = useCallback(() => {
        let reportAction = props.reportActions[`${props.route.params.reportActionID.toString()}`];

        // Handle threads if needed
        if (reportAction === undefined || reportAction.reportActionID === undefined) {
            reportAction = ReportActionsUtils.getParentReportAction(props.report);
        }

        return reportAction;
    }, [props.report, props.reportActions, props.route.params.reportActionID]);

    const flagComment = (severity) => {
        let reportID = getReportID(props.route);
        const reportAction = getActionToFlag();

        // Handle threads if needed
        if (ReportUtils.isChatThread(props.report) && reportAction.reportActionID === ReportActionsUtils.getParentReportAction(props.report).reportActionID) {
            reportID = ReportUtils.getParentReport(props.report).reportID;
        }

        if (ReportUtils.canFlagReportAction(reportAction, reportID)) {
            Report.flagComment(reportID, reportAction, severity);
        }

        Navigation.dismissModal();
    };

    const severityMenuItems = _.map(severities, (item, index) => (
        <MenuItem
            key={`${item.severity}_${index}`}
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
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!ReportUtils.shouldShowFlagComment(getActionToFlag(), props.report)}>
                    <HeaderWithBackButton title={props.translate('reportActionContextMenu.flagAsOffensive')} />
                    <ScrollView
                        contentContainerStyle={safeAreaPaddingBottomStyle}
                        style={styles.settingsPageBackground}
                    >
                        <View style={styles.pageWrapper}>
                            <View style={styles.settingsPageBody}>
                                <Text style={styles.baseFontStyle}>{props.translate('moderation.flagDescription')}</Text>
                            </View>
                        </View>
                        <Text style={[styles.ph5, styles.textLabelSupporting, styles.mb1]}>{props.translate('moderation.chooseAReason')}</Text>
                        {severityMenuItems}
                    </ScrollView>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

FlagCommentPage.propTypes = propTypes;
FlagCommentPage.defaultProps = defaultProps;
FlagCommentPage.displayName = 'FlagCommentPage';

export default compose(withLocalize, withReportAndReportActionOrNotFound)(FlagCommentPage);
