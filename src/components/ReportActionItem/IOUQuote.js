import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ControlSelection from '../../libs/ControlSelection';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import {showContextMenuForReport} from '../ShowContextMenuContext';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** The associated chatReport */
    chatReportID: PropTypes.string.isRequired,

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: PropTypes.shape({current: PropTypes.elementType}),

    /** Whether it is allowed to view details. */
    shouldAllowViewDetails: PropTypes.bool,

    /** Callback invoked when View Details is pressed */
    onViewDetailsPressed: PropTypes.func,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    contextMenuAnchor: null,
    shouldAllowViewDetails: false,
    onViewDetailsPressed: () => {},
    checkIfContextMenuActive: () => {},
};

const IOUQuote = props => (
    <View style={[styles.chatItemMessage]}>
        {_.map(props.action.message, (fragment, index) => (
            <Pressable
                key={`iouQuote-${props.action.reportActionID}-${index}`}
                onPress={props.shouldAllowViewDetails
                    ? props.onViewDetailsPressed
                    : () => {}}
                onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
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
                <Text>
                    <Text style={props.shouldAllowViewDetails && styles.chatItemMessageLink}>
                        {/* Get first word of IOU message */}
                        {Str.htmlDecode(fragment.text.split(' ')[0])}
                    </Text>
                    <Text style={[styles.chatItemMessage, styles.cursorPointer]}>
                        {/* Get remainder of IOU message */}
                        {Str.htmlDecode(fragment.text.substring(fragment.text.indexOf(' ')))}
                    </Text>
                </Text>
                <Icon src={Expensicons.ArrowRight} fill={props.shouldAllowViewDetails ? themeColors.icon : themeColors.transparent} />
            </Pressable>
        ))}
    </View>
);

IOUQuote.propTypes = propTypes;
IOUQuote.defaultProps = defaultProps;
IOUQuote.displayName = 'IOUQuote';

export default withLocalize(IOUQuote);
