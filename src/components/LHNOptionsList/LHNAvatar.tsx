import React from 'react';
import type {ColorValue, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import ReportActionAvatar from '@components/ReportActionAvatars/ReportActionAvatar';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type LHNAvatarProps = {
    icons: Icon[];
    shouldShowSubscript: boolean;
    size: ValueOf<typeof CONST.AVATAR_SIZE>;
    secondaryAvatarBackgroundColor?: ColorValue;
    singleAvatarContainerStyle?: ViewStyle[];
    subscriptAvatarBorderColor?: ColorValue;
    useMidSubscriptSize?: boolean;
    shouldShowTooltip?: boolean;
    delegateAccountID?: number;
};

/**
 * Lightweight avatar component for LHN rows. Reuses ReportActionAvatar sub-components
 * with pre-computed icons, avoiding the heavy hooks in ReportActionAvatars.
 */
function LHNAvatar({
    icons,
    shouldShowSubscript,
    size,
    secondaryAvatarBackgroundColor,
    singleAvatarContainerStyle,
    subscriptAvatarBorderColor,
    useMidSubscriptSize,
    shouldShowTooltip = false,
    delegateAccountID,
}: LHNAvatarProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const primaryIcon = icons.at(0);
    const secondaryIcon = icons.at(1);

    if (!primaryIcon) {
        return null;
    }

    if (icons.length === 1 || !secondaryIcon) {
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

    if (shouldShowSubscript) {
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

    const secondaryAvatarContainerStyle = secondaryAvatarBackgroundColor ? StyleUtils.getBackgroundAndBorderStyle(secondaryAvatarBackgroundColor) : undefined;

    return (
        <ReportActionAvatar.Multiple.Diagonal
            icons={[primaryIcon, secondaryIcon]}
            size={size}
            shouldShowTooltip={shouldShowTooltip}
            useMidSubscriptSize={useMidSubscriptSize ?? false}
            secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
            isInReportAction={false}
        />
    );
}

export default LHNAvatar;
