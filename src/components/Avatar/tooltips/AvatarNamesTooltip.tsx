import Tooltip from '@components/Tooltip';

import useLocalize from '@hooks/useLocalize';

import {getUserDetailTooltipText} from '@libs/ReportUtils';

import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {PropsWithChildren} from 'react';

import React from 'react';

import {useAreAvatarTooltipsDisabled} from './AvatarTooltipContext';

type AvatarNamesTooltipProps = PropsWithChildren<{
    /** Avatars the tooltip lists by name, in order */
    avatars: IconType[];
}>;

/** `AvatarNamesTooltip` shows a comma-separated list of avatar names, used by the "+N" overflow indicators.
 * Render it inside `AvatarTooltipsDisabled` to suppress the tooltip`.
 */
function AvatarNamesTooltip({avatars, children}: AvatarNamesTooltipProps) {
    const areTooltipsDisabled = useAreAvatarTooltipsDisabled();
    const {formatPhoneNumber, translate} = useLocalize();

    // Resolving the names is only worth it once the indicator actually renders with a tooltip, so it happens here rather than in the layouts.
    if (areTooltipsDisabled) {
        return children;
    }

    return <Tooltip text={avatars.map((avatar) => getUserDetailTooltipText(Number(avatar.id), formatPhoneNumber, translate, avatar.name)).join(', ')}>{children}</Tooltip>;
}

export default AvatarNamesTooltip;
