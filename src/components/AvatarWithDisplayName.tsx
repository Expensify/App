import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as UserUtils from '@libs/UserUtils';
import Avatar from './Avatar';
import Tooltip from './Tooltip';
import Text from './Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {Report} from '@src/types/onyx/Report';
import type {AvatarWithDisplayNameProps} from './AvatarWithDisplayName/types';

function AvatarWithDisplayName({
    report,
    personalDetails,
    isSmallSize = false,
    isInteractive = true,
    shouldShowTooltip = true,
    shouldUseDefaultAvatar = false,
    fallbackIcon,
    shouldShowSubscript = false,
    isDisabled = false,
    isHovered = false,
    isPressed = false,
    onAvatarPress,
    onAvatarLongPress,
    containerStyle,
    avatarStyle,
    textContainerStyle,
    textStyle,
    tooltipText,
    ...rest
}: AvatarWithDisplayNameProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [betas] = useOnyx(CONST.BETAS);

    // Determine the display name and email
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(personalDetails, false);
    const displayName = displayNamesWithTooltips[0]?.displayName ?? '';
    const email = displayNamesWithTooltips[0]?.login ?? '';

    // If we don't have a display name, we can't show a tooltip
    if (!displayName && !email) {
        return (
            <View style={containerStyle}>
                <Avatar
                    source={shouldUseDefaultAvatar ? UserUtils.getDefaultAvatarURL() : personalDetails?.[0]?.avatar}
                    size={isSmallSize ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                    fallbackIcon={fallbackIcon}
                    isDisabled={isDisabled}
                    isInteractive={isInteractive}
                    onAvatarPress={onAvatarPress}
                    onAvatarLongPress={onAvatarLongPress}
                    style={avatarStyle}
                    {...rest}
                />
            </View>
        );
    }

    const tooltipContent = tooltipText ?? email;

    const avatarComponent = (
        <View style={[styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <Avatar
                source={shouldUseDefaultAvatar ? UserUtils.getDefaultAvatarURL() : personalDetails?.[0]?.avatar}
                size={isSmallSize ? CONST.AVATAR_SIZE.SMALL : CONST.AVATAR_SIZE.DEFAULT}
                fallbackIcon={fallbackIcon}
                isDisabled={isDisabled}
                isInteractive={isInteractive}
                onAvatarPress={onAvatarPress}
                onAvatarLongPress={onAvatarLongPress}
                style={avatarStyle}
                {...rest}
            />
            <View style={[styles.ml3, textContainerStyle]}>
                <Text
                    style={[styles.optionAlternateText, styles.textLabelSupporting, textStyle]}
                    numberOfLines={1}
                >
                    {displayName}
                </Text>
                {shouldShowSubscript && (
                    <Text
                        style={[styles.optionAlternateText, styles.textLabelSupporting, styles.textMicro]}
                        numberOfLines={1}
                    >
                        {LocalePhoneNumber.formatPhoneNumber(email)}
                    </Text>
                )}
            </View>
        </View>
    );

    if (!shouldShowTooltip) {
        return avatarComponent;
    }

    return (
        <Tooltip
            text={tooltipContent}
            shouldRenderOnHover
            isDisabled={isDisabled}
        >
            {avatarComponent}
        </Tooltip>
    );
}

AvatarWithDisplayName.displayName = 'AvatarWithDisplayName';

export default AvatarWithDisplayName;