import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import HeaderWithCloseButton from './HeaderWithCloseButton';
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

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Whether we're viewing a report with a single transaction in it */
    isSingleTransactionView: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isSingleTransactionView: false,
};

const MoneyRequestHeader = (props) => {
    const formattedAmount = props.numberFormat(props.report.total / 100, {
        style: 'currency',
        currency: props.report.currency,
    });
    const isSettled = false; // TODO: use ReportUtils.isSettled(props.report.reportID) once that method is added
    const isExpenseReport = ReportUtils.isExpenseReport(props.report);
    const payeeName = isExpenseReport ? ReportUtils.getPolicyName(props.report, props.policies) : ReportUtils.getDisplayNameForParticipant(props.report.managerEmail);
    const payeeAvatar = isExpenseReport
        ? ReportUtils.getWorkspaceAvatar(props.report)
        : ReportUtils.getAvatar(lodashGet(props.personalDetails, [props.report.managerEmail, 'avatar']), props.report.managerEmail);
    return (
        <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
            <HeaderWithCloseButton
                shouldShowAvatarWithDisplay
                shouldShowThreeDotsButton={!isSettled}
                threeDotsMenuItems={[
                    {
                        icon: Expensicons.Trashcan,
                        text: props.translate('common.delete'),
                        onSelected: () => {},
                    },
                ]}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton}
                report={props.report}
                policies={props.policies}
                personalDetails={props.personalDetails}
                shouldShowCloseButton={false}
                shouldShowBackButton={props.isSmallScreenWidth}
                onBackButtonPress={() => Navigation.navigate(ROUTES.HOME)}
            />
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Avatar
                            source={payeeAvatar}
                            type={isExpenseReport ? CONST.ICON_TYPE_WORKSPACE : CONST.ICON_TYPE_AVATAR}
                            name={payeeName}
                            size={CONST.AVATAR_SIZE.HEADER}
                        />
                        <View style={[styles.flexColumn, styles.ml3]}>
                            <Text
                                style={[styles.headerText, styles.pre]}
                                numberOfLines={1}
                            >
                                {payeeName}
                            </Text>
                            {isExpenseReport && (
                                <Text
                                    style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                    numberOfLines={1}
                                >
                                    {props.translate('workspace.common.workspace')}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View style={[styles.flexRow]}>
                        {!props.isSingleTransactionView && <Text style={[styles.newKansasLarge]}>{formattedAmount}</Text>}
                        {isSettled && (
                            <View style={styles.moneyRequestHeaderCheckmark}>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={themeColors.iconSuccessFill}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

MoneyRequestHeader.displayName = 'MoneyRequestHeader';
MoneyRequestHeader.propTypes = propTypes;
MoneyRequestHeader.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(MoneyRequestHeader);
