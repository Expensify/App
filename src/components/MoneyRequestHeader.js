import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import HeaderWithBackButton from './HeaderWithBackButton';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import participantPropTypes from './participantPropTypes';
import styles from '../styles/styles';
import withWindowDimensions from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import * as Policy from '../libs/actions/Policy';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        email: null,
    },
    parentReport: {},
};

function MoneyRequestHeader(props) {
    const moneyRequestReport = props.parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const policy = props.policies[`${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}`];
    const isPayer =
        Policy.isAdminOfFreePolicy([policy]) || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(props.session, 'accountID', null) === moneyRequestReport.managerID);
    const report = props.report;
    report.ownerAccountID = lodashGet(props, ['parentReport', 'ownerAccountID'], null);
    report.ownerEmail = lodashGet(props, ['parentReport', 'ownerEmail'], '');
    return (
        <View style={[styles.pl0]}>
            <HeaderWithBackButton
                shouldShowAvatarWithDisplay
                shouldShowPinButton={false}
                shouldShowThreeDotsButton={!isPayer && !isSettled}
                threeDotsMenuItems={[
                    {
                        icon: Expensicons.Trashcan,
                        text: props.translate('common.delete'),
                        onSelected: () => {},
                    },
                ]}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(props.windowWidth)}
                report={report}
                policies={props.policies}
                personalDetails={props.personalDetails}
                shouldShowBackButton={props.isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack(ROUTES.HOME, false, true)}
                shouldShowBorderBottom
            />
        </View>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';
MoneyRequestHeader.propTypes = propTypes;
MoneyRequestHeader.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        parentReport: {
            key: (props) => `${ONYXKEYS.COLLECTION.REPORT}${props.report.parentReportID}`,
        },
    }),
)(MoneyRequestHeader);
