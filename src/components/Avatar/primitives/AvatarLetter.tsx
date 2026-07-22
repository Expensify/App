import type {AvatarPrimitivesCommonProps} from '@components/Avatar/types';
import UserInitialsAvatar from '@components/UserInitialsAvatar';

import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isLetterAvatarSchemeKey, LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';
import type {LetterAvatarColorStyle} from '@libs/Avatars/letterAvatarPalette';

import ONYXKEYS from '@src/ONYXKEYS';
import {avatarStyleColorSelector} from '@src/selectors/PersonalDetails';

import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type UserLetterAvatarProps = AvatarPrimitivesCommonProps & {
    /** Initials parsed from the generated letter-avatar URL */
    initials: string;

    /** Colors encoded in the generated letter-avatar URL */
    urlColors: LetterAvatarColorStyle;

    /** Account whose picked avatarStyle color overrides the URL colors */
    accountID: number | undefined;

    /** Styles for View wrapping the initials. */
    containerStyles?: StyleProp<ViewStyle & ImageStyle>;

    /** Additional styles for the wrapping View. */
    containerAdditionalStyles?: StyleProp<ViewStyle>;
};

function AvatarLetter({initials, urlColors, accountID, size, type, containerStyles, containerAdditionalStyles: initialsAdditionalStyles}: UserLetterAvatarProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const avatarSize = StyleUtils.getAvatarSize(size);
    const baseContainerStyles = containerStyles ? [StyleUtils.getAvatarStyle(size), styles.bgTransparent, containerStyles] : undefined;

    // A picked avatarStyle color is authoritative over the color encoded in the URL.
    const [pickedColorKey] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: avatarStyleColorSelector(accountID),
    });
    const colors = pickedColorKey && isLetterAvatarSchemeKey(pickedColorKey) ? LETTER_AVATAR_SCHEMES[pickedColorKey] : urlColors;

    return (
        <View style={[baseContainerStyles, StyleUtils.getAvatarBorderStyle(size, type), initialsAdditionalStyles]}>
            <UserInitialsAvatar
                text={initials}
                colors={colors}
                size={avatarSize}
            />
        </View>
    );
}

export default AvatarLetter;
