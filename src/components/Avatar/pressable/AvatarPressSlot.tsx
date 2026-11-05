import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ReactNode} from 'react';

import React from 'react';

import {useAvatarPress} from './AvatarPressContext';

type AvatarPressSlotProps = {
    /** Icon passed to the press handler */
    avatar: Icon;

    children: ReactNode;
};

/** Makes one avatar pressable under an `AvatarPressProvider`. */
function AvatarPressSlot({avatar, children}: AvatarPressSlotProps) {
    const {translate} = useLocalize();
    const avatarPress = useAvatarPress();

    // Placeholder avatars have no page to open
    if (!avatarPress || !avatar.id) {
        return children;
    }

    // Name tells apart same-type avatars in a stack
    const accessibilityLabel = [translate(avatar.type === CONST.ICON_TYPE_WORKSPACE ? 'common.workspaces' : 'common.profile'), avatar.name].filter(Boolean).join(', ');

    return (
        <PressableWithoutFocus
            onPress={() => avatarPress.onAvatarPress(avatar)}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel={avatarPress.sentryLabel}
        >
            {children}
        </PressableWithoutFocus>
    );
}

export default AvatarPressSlot;
