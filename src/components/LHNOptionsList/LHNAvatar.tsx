import React from 'react';
import type {ColorValue, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import ReportActionAvatar from '@components/ReportActionAvatars/ReportActionAvatar';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type LHNAvatarProps = {
    icons: Icon[];
    shouldShowSubscript: boolean;
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    singleAvatarContainerStyle?: ViewStyle[];
    subscriptAvatarBorderColor?: ColorValue;
    shouldShowTooltip?: boolean;
    delegateAccountID?: number;
};

/**
 * Lightweight avatar component for LHN rows.
 * LHN only renders SINGLE or SUBSCRIPT — never diagonal.
 */
function LHNAvatar({icons, shouldShowSubscript, size, singleAvatarContainerStyle, subscriptAvatarBorderColor, shouldShowTooltip = false, delegateAccountID}: LHNAvatarProps) {
    const theme = useTheme();

    const primaryIcon = icons.at(0);
    const secondaryIcon = icons.at(1);

    if (!primaryIcon) {
        return null;
    }

    if (shouldShowSubscript && secondaryIcon) {
        return (
            <ReportActionAvatar.Subscript
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                size={size}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor ?? theme.componentBG}
                shouldShowTooltip={shouldShowTooltip}
            />
        );
    }

    return (
        <ReportActionAvatar.Single
            accountID={Number(primaryIcon.id ?? CONST.DEFAULT_NUMBER_ID)}
            avatar={primaryIcon}
            shouldShowTooltip={shouldShowTooltip}
            size={size}
            containerStyles={singleAvatarContainerStyle}
            fallbackIcon={primaryIcon.fallbackIcon}
            delegateAccountID={delegateAccountID}
        />
    );
}

export default LHNAvatar;
