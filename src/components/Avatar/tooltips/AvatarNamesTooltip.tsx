import Tooltip from '@components/Tooltip';

import useLocalize from '@hooks/useLocalize';

import {getUserDetailTooltipText} from '@libs/ReportUtils';

import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {PropsWithChildren} from 'react';

import React from 'react';

import {useAreAvatarTooltipsEnabled} from './AvatarTooltipContext';

type AvatarNamesTooltipProps = PropsWithChildren<{
    /** Avatars the tooltip lists by name, in order */
    avatars: IconType[];
}>;

/** `AvatarNamesTooltip` shows a comma-separated list of avatar names, used by the "+N" overflow indicators.
 * Render it inside `AvatarTooltipsProvider` with `isEnabled={false}` to suppress the tooltip`.
 */
function AvatarNamesTooltip({avatars, children}: AvatarNamesTooltipProps) {
    const areTooltipsEnabled = useAreAvatarTooltipsEnabled();
    const {formatPhoneNumber, translate} = useLocalize();

    if (!areTooltipsEnabled) {
        return children;
    }

    const text = avatars.map((avatar) => getUserDetailTooltipText(Number(avatar.id), formatPhoneNumber, translate, avatar.name)).join(', ');
    return <Tooltip text={text}>{children}</Tooltip>;
}

export default AvatarNamesTooltip;
