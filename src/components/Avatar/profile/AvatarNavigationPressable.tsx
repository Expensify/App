import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';

type AvatarNavigationPressableProps = {
    /** Opens the avatar page of the avatar's owner */
    onPress: () => void;

    /** Localized label describing whose avatar page opens */
    accessibilityLabel: string;

    /** The avatar to make pressable */
    children: ReactNode;
};

/** Makes an avatar pressable. The avatar page it opens and the label describing it are decided by the caller. */
function AvatarNavigationPressable({onPress, accessibilityLabel, children}: AvatarNavigationPressableProps) {
    return (
        <PressableWithoutFocus
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_AVATAR}
        >
            {children}
        </PressableWithoutFocus>
    );
}

export default AvatarNavigationPressable;
