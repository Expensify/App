import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {togglePinnedState} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Tooltip from './Tooltip';

type PinButtonProps = {
    /** Report to pin */
    report: Report;
};

function PinButton({report}: PinButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Tooltip text={report.isPinned ? translate('common.unPin') : translate('common.pin')}>
            <PressableWithFeedback
                onPress={callFunctionIfActionIsAllowed(() => togglePinnedState(report.reportID, report.isPinned ?? false))}
                style={styles.touchableButtonImage}
                accessibilityLabel={report.isPinned ? translate('common.unPin') : translate('common.pin')}
                role={CONST.ROLE.BUTTON}
            >
                <Icon
                    src={Expensicons.Pin}
                    fill={report.isPinned ? theme.heading : theme.icon}
                />
            </PressableWithFeedback>
        </Tooltip>
    );
}

export default PinButton;
