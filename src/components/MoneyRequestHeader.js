import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import SettlementButton from './SettlementButton';
import CONST from '../CONST';
import Text from './Text';
import participantPropTypes from './participantPropTypes';
import Avatar from './Avatar';
import styles from '../styles/styles';
import {getDefaultWorkspaceAvatar, getPolicyName} from '../libs/ReportUtils';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    personalDetails: PropTypes.objectOf(participantPropTypes),

    isTransactionDetail: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isTransactionDetail: false,
};

const MoneyRequestHeader = (props) => {
    const formattedAmount = props.numberFormat(props.report.total, {
        style: 'currency',
        currency: props.report.currency,
    });
    const isSettled = /* ReportUtils.isSettled(props.report.reportID); */ false;
    const isAdmin = ReportUtils.isPolicyExpenseChatAdmin(props.report, props.policies);
    const workspaceName = ReportUtils.getPolicyName(props.report, props.policies);
    const workspaceAvatar = ReportUtils.getWorkspaceAvatar(props.report, props.policies);
    return (
        <View style={[

        ]}
        >
            <HeaderWithCloseButton
                shouldShowAvatarWithDisplay
                shouldShowThreeDotsButton={!isSettled}
                threeDotsMenuItems={[{
                    icon: Expensicons.Trashcan,
                    text: props.translate('common.delete'),
                    onSelected: () => {},
                }]}
                report={props.report}
                policies={props.policies}
                personalDetails={props.personalDetails}
            />
            <Text>To</Text>
            <View style={[
                styles.flex1,
                styles.flexRow,
                styles.alignItemsCenter,
                styles.justifyContentBetween,
            ]}
            >
                <View style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                ]}
                >
                    <Avatar
                        source={workspaceAvatar}
                    />
                    <Text
                        style={[styles.headerText, styles.pre]}
                        numberOfLines={1}
                    >
                        {workspaceName}
                    </Text>
                </View>
                <View>
                    {!props.isSingleRequest && (
                        <Text>{formattedAmount}</Text>
                    )}
                    {isAdmin && !isSettled && (
                        <SettlementButton />
                    )}
                </View>
            </View>
        </View>
    );
};

MoneyRequestHeader.displayName = 'MoneyRequestHeader';
MoneyRequestHeader.propTypes = propTypes;
MoneyRequestHeader.defaultProps = defaultProps;

export default withLocalize(MoneyRequestHeader);
