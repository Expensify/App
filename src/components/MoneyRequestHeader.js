import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../styles/colors';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import iouReportPropTypes from '../pages/iouReportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import SettlementButton from './SettlementButton';
import CONST from '../CONST';

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

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
    return (
        <MoneyRequestHeader
            style={colors.greenHighlightBackground}
        >
            <HeaderWithCloseButton
                showAvatarWithDisplay
                shouldShowThreeDotsButton={!isSettled}
                threeDotsMenuItems={[{
                    icon: Expensicons.Trashcan,
                    text: props.translate('common.delete'),
                    onSelected: () => {},
                }]}
                report={props.report}
            />
            <Text>To</Text>
            <View>
                <AvatarWithDisplayName
                    avatarSize={CONST.AVATAR_SIZE.DEFAULT}
                    report={props.report}
                    personalDetails={props.personalDetails}
                    policies={props.policies}
                />
                {!props.isSingleRequest && (
                    <Text>{formattedAmount}</Text>
                )}

            </View>
            {isAdmin && !isSettled && (
                <SettlementButton />
            )}
        </MoneyRequestHeader>
    );
};

MoneyRequestHeader.displayName = 'MoneyRequestHeader';
MoneyRequestHeader.propTypes = propTypes;
MoneyRequestHeader.defaultProps = defaultProps;

export default withLocalize(MoneyRequestHeader);
