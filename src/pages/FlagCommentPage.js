import React from 'react';
import _ from 'underscore';
import {View, ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import reportPropTypes from './reportPropTypes';
import reportActionPropTypes from './home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
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
    let reportAction = props.reportActions[`${props.route.params.reportActionID.toString()}`];
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

    const flagComment = (severity) => {
        let reportID = getReportID(props.route);

        // Handle threads if needed
        if (reportAction === undefined) {
            reportID = ReportUtils.getParentReport(props.report).reportID;
            reportAction = ReportActionsUtils.getParentReportAction(props.report);
        }
        Report.flagComment(reportID, reportAction, severity);
        Navigation.dismissModal();
    };

    const severityMenuItems = _.map(severities, (item, index) => (
        <MenuItem
            key={`${item.severity}_${index}`}
            shouldShowRightIcon
            title={item.name}
            description={item.description}
            onPress={Session.checkIfActionIsAllowed(() => flagComment(item.severity))}
            style={[styles.pt2, styles.pb4, styles.mh5, styles.ph0, styles.flexRow, styles.borderBottom]}
            furtherDetails={item.furtherDetails}
            furtherDetailsIcon={item.furtherDetailsIcon}
            hoverAndPressStyle={[styles.mh0, styles.ph5]}
        />
    ));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
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
                </>
            )}
        </ScreenWrapper>
    );
}

FlagCommentPage.propTypes = propTypes;
FlagCommentPage.defaultProps = defaultProps;
FlagCommentPage.displayName = 'FlagCommentPage';

export default compose(
    withLocalize,
    withOnyx({
        reportActions: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getReportID(route)}`,
            canEvict: false,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${getReportID(route)}`,
        },
    }),
)(FlagCommentPage);
