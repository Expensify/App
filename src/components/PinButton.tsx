import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {togglePinnedState} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import {authTokenTypeSelector} from '@selectors/Session';
import React from 'react';

import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Tooltip from './Tooltip';

type PinButtonProps = {
    report: Report;
};

function PinButton({report}: PinButtonProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Pin']);

    return (
        <Tooltip text={report.isPinned ? translate('common.unPin') : translate('common.pin')}>
            <PressableWithFeedback
                onPress={callFunctionIfActionIsAllowed(() => togglePinnedState(report.reportID, report.isPinned ?? false), false, session)}
                style={styles.touchableButtonImage}
                accessibilityLabel={report.isPinned ? translate('common.unPin') : translate('common.pin')}
                role={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.PIN_BUTTON.TOGGLE}
            >
                <Icon
                    src={icons.Pin}
                    fill={report.isPinned ? theme.heading : theme.icon}
                />
            </PressableWithFeedback>
        </Tooltip>
    );
}

export default PinButton;
