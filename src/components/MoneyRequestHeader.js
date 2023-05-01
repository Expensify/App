import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
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

const propTypes = {
    /** The report currently being looked at */
    report: iouReportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

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
    const isSettled = /* ReportUtils.isSettled(props.report.reportID); */ false;
    const workspaceName = ReportUtils.getPolicyName(props.report, props.policies);
    const workspaceAvatar = ReportUtils.getWorkspaceAvatar(props.report, props.policies);
    return (
        <View style={[
            {backgroundColor: themeColors.highlightBG},
            styles.pl0,
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
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton}
                report={props.report}
                policies={props.policies}
                personalDetails={props.personalDetails}
                containerStyles={[styles.pt5, styles.pb3]}
                shouldShowCloseButton={false}
                shouldShowBackButton={props.isSmallScreenWidth}
            />
            <View style={[styles.ph5, styles.pb5]}>
                <Text style={[styles.textLabelSupporting, styles.lh16]}>To</Text>
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    styles.pv3,
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
                            type={CONST.ICON_TYPE_WORKSPACE}
                            name={workspaceName}
                            size={CONST.AVATAR_SIZE.HEADER}
                        />
                        <View style={[styles.flexColumn, styles.ml3]}>
                            <Text
                                style={[styles.headerText, styles.pre]}
                                numberOfLines={1}
                            >
                                {workspaceName}
                            </Text>
                            <Text
                                style={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                                numberOfLines={1}
                            >
                                Workspace
                            </Text>
                        </View>
                    </View>
                    <View>
                        {!props.isSingleTransactionView && (
                            <Text style={[styles.newKansasLarge]}>{formattedAmount}</Text>
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

export default compose(
    withWindowDimensions,
    withLocalize,
)(MoneyRequestHeader);
