import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Text from '../Text';
import Icon from '../Icon';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import ControlSelection from '../../libs/ControlSelection';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {showContextMenuForReport} from '../ShowContextMenuContext';
import * as StyleUtils from '../../styles/StyleUtils';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import * as ReportUtils from '../../libs/ReportUtils';
import Button from '../Button';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import themeColors from '../../styles/themes/default';
import getButtonState from '../../libs/getButtonState';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** The active IOUReport, used for Onyx subscription */
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.string.isRequired,

    /** Active IOU Report for current report */
    iouReport: PropTypes.shape({
        /** Email address of the manager in this iou report */
        managerEmail: PropTypes.string,

        /** Email address of the creator of this iou report */
        ownerEmail: PropTypes.string,

        /** Outstanding amount in cents of this transaction */
        total: PropTypes.number,

        /** Currency of outstanding amount of this transaction */
        currency: PropTypes.string,

        /** Does the iouReport have an outstanding IOU? */
        hasOutstandingIOU: PropTypes.bool,
    }),

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }),

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: PropTypes.shape({current: PropTypes.elementType}),

    /** Callback invoked when View Details is pressed */
    onViewDetailsPressed: PropTypes.func,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    contextMenuAnchor: null,
    isHovered: false,
    iouReport: {},
    onViewDetailsPressed: () => {},
    checkIfContextMenuActive: () => {},
    session: {
        email: null,
    },
};

const ReportPreview = (props) => {
    const reportAmount = CurrencyUtils.convertToDisplayString(ReportUtils.getMoneyRequestTotal(props.iouReport), props.iouReport.currency);
    const managerEmail = props.iouReport.managerEmail || '';
    const managerName = ReportUtils.getDisplayNameForParticipant(managerEmail, true);
    const isCurrentUserManager = managerEmail === lodashGet(props.session, 'email', null);
    return (
        <View style={[styles.chatItemMessage, styles.mt4]}>
            {_.map(props.action.message, (index) => (
                <Pressable
                    key={`ReportPreview-${props.action.reportActionID}-${index}`}
                    onPress={props.onViewDetailsPressed}
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive)}
                    style={[styles.flexRow, styles.justifyContentBetween]}
                    focusable
                >
                    <View style={[styles.flexShrink1]}>
                        {props.iouReport.hasOutstandingIOU ? (
                            <Text style={[styles.chatItemMessage, styles.cursorPointer]}>{props.translate('iou.payerOwesAmount', {payer: managerName, amount: reportAmount})}</Text>
                        ) : (
                            <View style={[styles.flexRow]}>
                                <Text style={[styles.chatItemMessage, styles.cursorPointer]}>{props.translate('iou.payerSettled', {amount: reportAmount})}</Text>
                                {!props.iouReport.hasOutstandingIOU && (
                                    <Icon
                                        style={[styles.ml10]}
                                        src={Expensicons.Checkmark}
                                        fill={themeColors.iconSuccessFill}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                    <Icon
                        src={Expensicons.ArrowRight}
                        fill={StyleUtils.getIconFillColor(getButtonState(props.isHovered))}
                    />
                </Pressable>
            ))}
            {isCurrentUserManager && props.iouReport.stateNum === CONST.REPORT.STATE_NUM.PROCESSING && (
                <Button
                    style={[styles.requestPreviewBox]}
                    onPress={() => {
                        Navigation.navigate(ROUTES.getIouDetailsRoute(props.chatReportID, props.iouReportID));
                    }}
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    text={props.translate('iou.pay')}
                    success
                    medium
                />
            )}
        </View>
    );
};

ReportPreview.propTypes = propTypes;
ReportPreview.defaultProps = defaultProps;
ReportPreview.displayName = 'ReportPreview';

export default compose(
    withLocalize,
    withOnyx({
        iouReport: {
            key: ({iouReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportPreview);
