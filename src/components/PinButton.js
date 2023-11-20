import React from 'react';
import reportPropTypes from '@pages/reportPropTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Tooltip from './Tooltip';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** Report to pin */
    report: reportPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    report: null,
};

function PinButton(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <Tooltip text={props.report.isPinned ? props.translate('common.unPin') : props.translate('common.pin')}>
            <PressableWithFeedback
                onPress={Session.checkIfActionIsAllowed(() => Report.togglePinnedState(props.report.reportID, props.report.isPinned))}
                style={[styles.touchableButtonImage]}
                ariaChecked={props.report.isPinned}
                accessibilityLabel={props.report.isPinned ? props.translate('common.unPin') : props.translate('common.pin')}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Icon
                    src={Expensicons.Pin}
                    fill={props.report.isPinned ? theme.heading : theme.icon}
                />
            </PressableWithFeedback>
        </Tooltip>
    );
}

PinButton.displayName = 'PinButton';
PinButton.propTypes = propTypes;
PinButton.defaultProps = defaultProps;

export default withLocalize(PinButton);
