import _, {compose} from 'underscore';
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ControlSelection from '../../libs/ControlSelection';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {showContextMenuForReport} from '../ShowContextMenuContext';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The ID of the associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: PropTypes.shape({current: PropTypes.elementType}),

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /** Whether the IOU is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    /** The active IOUReport, used for Onyx subscription */
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: PropTypes.string.isRequired,

    /* Onyx Props */
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

    ...withLocalizePropTypes,
};

const defaultProps = {
    contextMenuAnchor: undefined,
    checkIfContextMenuActive: () => {},
    isHovered: false,
};

const ReportPreview = (props) => {

    if (props.iouReport.total === 0) {
        return null;
    }

    const launchDetailsModal = () => {
        Navigation.navigate(ROUTES.getIouDetailsRoute(props.chatReportID, props.action.originalMessage.IOUReportID));
    };

    const cachedTotal = props.iouReport.total && props.iouReport.currency
        ? props.numberFormat(
            Math.abs(props.iouReport.total) / 100,
            {style: 'currency', currency: props.iouReport.currency},
        ) : '';

    return (
        <View style={[styles.chatItemMessage]}>
            {_.map(props.action.message, (fragment, index) => (
                <Pressable
                    key={`reportPreview-${props.action.reportActionID}-${index}`}
                    onPress={launchDetailsModal}
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={event => showContextMenuForReport(
                        event,
                        props.contextMenuAnchor,
                        props.chatReportID,
                        props.action,
                        props.checkIfContextMenuActive,
                    )}
                    style={[styles.flexRow, styles.justifyContentBetween,
                    props.shouldAllowViewDetails
                        ? undefined
                        : styles.cursorDefault,
                    ]}
                    focusable={props.shouldAllowViewDetails}
                >
                    <Text style={[styles.flex1, styles.mr2]}>
                        <Text style={props.shouldAllowViewDetails && styles.chatItemMessageLink}>
                            {/* Get first word of IOU message */}
                            {fragment.text.split(' ')[0]}
                        </Text>
                        <Text style={[styles.chatItemMessage, props.shouldAllowViewDetails
                            ? styles.cursorPointer
                            : styles.cursorDefault]}
                        >
                            {/* Get remainder of IOU message */}
                            {fragment.text.substring(fragment.text.indexOf(' '))}
                        </Text>
                    </Text>
                    <Icon src={Expensicons.ArrowRight} fill={props.shouldAllowViewDetails ? StyleUtils.getIconFillColor(getButtonState(props.isHovered)) : themeColors.transparent} />
                </Pressable>
            ))}
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
    }),
)(ReportPreview);
