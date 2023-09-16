import React from 'react';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import Icon from './Icon';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import reportPropTypes from '../pages/reportPropTypes';
import * as Report from '../libs/actions/Report';
import * as Expensicons from './Icon/Expensicons';
import * as Session from '../libs/actions/Session';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import CONST from '../CONST';

const propTypes = {
    /** Report to pin */
    report: reportPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: null,
};

function PinButton(props) {
    return (
        <Tooltip text={props.report.isPinned ? props.translate('common.unPin') : props.translate('common.pin')}>
            <PressableWithFeedback
                onPress={Session.checkIfActionIsAllowed(() => Report.togglePinnedState(props.report.reportID, props.report.isPinned))}
                style={[styles.touchableButtonImage]}
                accessibilityState={{checked: props.report.isPinned}}
                accessibilityLabel={props.report.isPinned ? props.translate('common.unPin') : props.translate('common.pin')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Icon
                    src={Expensicons.Pin}
                    fill={props.report.isPinned ? themeColors.heading : themeColors.icon}
                />
            </PressableWithFeedback>
        </Tooltip>
    );
}

PinButton.displayName = 'PinButton';
PinButton.propTypes = propTypes;
PinButton.defaultProps = defaultProps;

export default withLocalize(PinButton);
