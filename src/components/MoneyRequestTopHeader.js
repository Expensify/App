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
import Text from './Text';
import participantPropTypes from './participantPropTypes';
import Avatar from './Avatar';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import withWindowDimensions from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Icon from './Icon';
import SettlementButton from './SettlementButton';
import * as Policy from '../libs/actions/Policy';
import ONYXKEYS from '../ONYXKEYS';
import * as IOU from '../libs/actions/IOU';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import DateUtils from '../libs/DateUtils';
import reportPropTypes from '../pages/reportPropTypes';
import * as UserUtils from '../libs/UserUtils';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The expense report or iou report (only will have a value if this is a transaction thread) */
    parentReport: iouReportPropTypes,

    /** The policies which the user has access to */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The policy name */
            name: PropTypes.string,

            /** The type of the policy */
            type: PropTypes.string,
        }),
    ),


    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Whether we're viewing a report with a single transaction in it */
    isSingleTransactionView: PropTypes.bool,

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isSingleTransactionView: false,
    session: {
        email: null,
    },
    parentReport: {},
};

const MoneyRequestTopHeader = (props) => {
    const moneyRequestReport = props.isSingleTransactionView ? props.parentReport : props.report;
    const isSettled = ReportUtils.isSettled(moneyRequestReport.reportID);
    const policy = props.policies[`${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}`];
    const isPayer =
        Policy.isAdminOfFreePolicy([policy]) || (ReportUtils.isMoneyRequestReport(moneyRequestReport) && lodashGet(props.session, 'email', null) === moneyRequestReport.managerEmail);
    return (
        <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
            
                <HeaderWithBackButton
                    shouldShowAvatarWithDisplay
                    shouldShowPinButton={props.isSingleTransactionView}
                    shouldShowThreeDotsButton={!isPayer && !isSettled && props.isSingleTransactionView}
                    threeDotsMenuItems={[
                        {
                            icon: Expensicons.Trashcan,
                            text: props.translate('common.delete'),
                            onSelected: () => {},
                        },
                    ]}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(props.windowWidth)}
                    report={props.report}
                    parentReport={moneyRequestReport}
                    policies={props.policies}
                    personalDetails={props.personalDetails}
                    shouldShowBackButton={props.isSmallScreenWidth}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.HOME)}
                />
        </View>
    );
};

MoneyRequestTopHeader.displayName = 'MoneyRequestTopHeader';
MoneyRequestTopHeader.propTypes = propTypes;
MoneyRequestTopHeader.defaultProps = defaultProps;

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
)(MoneyRequestTopHeader);
