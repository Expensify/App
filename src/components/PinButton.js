import React from 'react';
import {Pressable} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import Icon from './Icon';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import reportPropTypes from '../pages/reportPropTypes';
import * as Report from '../libs/actions/Report';
import * as Expensicons from './Icon/Expensicons';
import * as Session from '../libs/actions/Session';

const propTypes = {
    /** Report to pin */
    report: reportPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: null,
};

const PinButton = (props) => (
    <Tooltip text={props.report.isPinned ? props.translate('common.unPin') : props.translate('common.pin')}>
        <Pressable
            onPress={Session.checkIfActionIsAllowed(() => Report.togglePinnedState(props.report.reportID, props.report.isPinned))}
            style={[styles.touchableButtonImage]}
        >
            <Icon
                src={Expensicons.Pin}
                fill={props.report.isPinned ? themeColors.heading : themeColors.icon}
            />
        </Pressable>
    </Tooltip>
);

PinButton.displayName = 'PinButton';
PinButton.propTypes = propTypes;
PinButton.defaultProps = defaultProps;

export default withLocalize(PinButton);
