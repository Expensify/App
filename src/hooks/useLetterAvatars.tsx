import React, {useMemo} from 'react';
import type {SvgProps} from 'react-native-svg';
import ColoredLetterAvatar from '@components/ColoredLetterAvatar';
import {getLetterAvatar, LETTER_AVATAR_COLOR_OPTIONS} from '@libs/Avatars/PresetAvatarCatalog';
import getFirstAlphaNumericCharacter from '@libs/getFirstAlphaNumericCharacter';
import type {AvatarSizeName} from '@styles/utils';

/**
 * Represents a single letter avatar item with its unique identifier and styled component.
 */
type LetterAvatarItem = {
    /** Unique identifier combining background color, fill color, and initial letter */
    id: string;
    /** Styled letter avatar component with applied colors */
    StyledLetterAvatar: React.FC<SvgProps>;
};

/**
 * Return type for useLetterAvatars hook containing avatar data in multiple formats.
 */
type LetterAvatarsResult = {
    /** Array of avatar items for use in AvatarSelector component, containing all color variations */
    avatarList: LetterAvatarItem[];
    /** Object mapping avatar IDs to components for quick lookup in AvatarPage component */
    avatarMap: Record<string, React.FC<SvgProps>>;
};

/**
 * Generates letter avatars based on a user's name initial in all available color combinations.
 *
 * @param name - The user's name from which the first alphanumeric character is extracted
 * @param size - Optional size for the avatars
 * @returns Object with avatarList (array for AvatarSelector) and avatarMap (lookup for AvatarPage)
 */
function useLetterAvatars(name: string | undefined, size?: AvatarSizeName): LetterAvatarsResult {
    return useMemo(() => {
        const avatarComponent = getLetterAvatar(name);

        if (!avatarComponent) {
            return {avatarList: [], avatarMap: {}};
        }

        const avatarList: LetterAvatarItem[] = [];
        const avatarMap: Record<string, React.FC<SvgProps>> = {};

        for (const {fillColor, backgroundColor} of LETTER_AVATAR_COLOR_OPTIONS) {
            function StyledLetterAvatar() {
                return (
                    <ColoredLetterAvatar
                        fillColor={fillColor}
                        backgroundColor={backgroundColor}
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        component={avatarComponent!}
                        size={size}
                    />
                );
            }
            const id = `letter-avatar-${backgroundColor}-${fillColor}-${getFirstAlphaNumericCharacter(name)}`;

            avatarList.push({
                id,
                StyledLetterAvatar,
            });

            avatarMap[id] = StyledLetterAvatar;
        }

        return {
            avatarList,
            avatarMap,
        };
    }, [name, size]);
}

export default useLetterAvatars;
export type {LetterAvatarItem, LetterAvatarsResult};
