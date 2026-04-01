import React from 'react';
import {View} from 'react-native';
import Avatar from '@components/Avatar';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getUserDetailTooltipText, sortIconsByName} from '@libs/ReportUtils';
import {getDefaultAvatar} from '@libs/UserAvatarUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

type AttendeesCellProps = {
    attendees: Attendee[];
    isHovered: boolean;
    isPressed: boolean;
};

function AttendeesCell({attendees, isHovered, isPressed}: AttendeesCellProps) {
    const defaultAvatars = useDefaultAvatars();
    const attendeeIcons: IconType[] = attendees.map((attendee) => ({
        id: attendee.accountID ?? CONST.DEFAULT_NUMBER_ID,
        name: attendee.displayName ?? attendee.email,
        source: (attendee.avatarUrl || getDefaultAvatar({accountID: attendee.accountID, accountEmail: attendee.email, defaultAvatars})) ?? '',
        type: CONST.ICON_TYPE_AVATAR,
    }));

    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {localeCompare, formatPhoneNumber} = useLocalize();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const size = CONST.AVATAR_SIZE.SMALLER;
    const maxAvatarsInRow = CONST.AVATAR_ROW_SIZE.DEFAULT;
    const oneAvatarSize = StyleUtils.getAvatarStyle(size);
    const oneAvatarBorderWidth = StyleUtils.getAvatarBorderWidth(size).borderWidth ?? 0;
    const overlapSize = oneAvatarSize.width / 3 + 2 * oneAvatarBorderWidth;
    const height = oneAvatarSize.height;
    const avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height), styles.overflowHidden]);

    const icons = sortIconsByName(attendeeIcons, personalDetails, localeCompare);
    const tooltipTexts = icons.map((icon) => getUserDetailTooltipText(Number(icon.id), formatPhoneNumber, icon.name));

    return (
        <View
            style={avatarContainerStyles}
            testID="AttendeesCell-Row"
        >
            {[...icons].splice(0, maxAvatarsInRow).map((icon, index) => (
                <UserDetailsTooltip
                    // eslint-disable-next-line react/no-array-index-key
                    key={`stackedAvatars-${icon.id}-${index}`}
                    accountID={Number(icon.id)}
                    icon={icon}
                    fallbackUserDetails={{
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: icon.name,
                    }}
                    shouldRender
                >
                    <View style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize, -oneAvatarBorderWidth), StyleUtils.getAvatarBorderRadius(size, icon.type)]}>
                        <Avatar
                            iconAdditionalStyles={[
                                StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                    theme,
                                    isHovered,
                                    isPressed,
                                    isInReportAction: true,
                                    shouldUseCardBackground: true,
                                    isActive: false,
                                    customPressedBorderColor: theme.activeComponentBG,
                                }),
                                StyleUtils.getAvatarBorderWidth(size),
                            ]}
                            source={icon.source}
                            size={size}
                            name={icon.name}
                            avatarID={icon.id}
                            type={icon.type}
                            fallbackIcon={icon.fallbackIcon}
                            testID="AttendeesCell-Avatar"
                        />
                    </View>
                </UserDetailsTooltip>
            ))}
            {icons.length > maxAvatarsInRow && (
                <Tooltip
                    // We only want to cap tooltips to only 10 users or so since some reports have hundreds of users, causing performance to degrade.
                    text={tooltipTexts.slice(maxAvatarsInRow - 1, maxAvatarsInRow + 9).join(', ')}
                    shouldRender
                >
                    <View
                        testID="AttendeesCell-LimitReached"
                        style={[
                            styles.alignItemsCenter,
                            styles.justifyContentCenter,
                            StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                theme,
                                isHovered,
                                isPressed,
                                isInReportAction: true,
                                shouldUseCardBackground: true,
                                customPressedBorderColor: theme.activeComponentBG,
                            }),

                            // Set overlay background color with RGBA value so that the text will not inherit opacity
                            StyleUtils.getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth),
                            icons.at(3)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, icons.at(3)?.type),
                            StyleUtils.getBackgroundColorWithOpacityStyle(colors.productDark400, variables.overlayOpacity),
                        ]}
                    >
                        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, StyleUtils.getHeight(oneAvatarSize.height), StyleUtils.getWidthStyle(oneAvatarSize.width)]}>
                            <Text
                                style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(size), styles.userSelectNone, styles.textMicroBold, styles.buttonSuccessText]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >{`+${icons.length - maxAvatarsInRow}`}</Text>
                        </View>
                    </View>
                </Tooltip>
            )}
        </View>
    );
}

export default AttendeesCell;
