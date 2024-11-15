import type {FC} from 'react';
import type {SvgProps} from 'react-native-svg';
import Avatar1 from '@assets/images/avatars/user/default-avatar_1.svg';
import Avatar2 from '@assets/images/avatars/user/default-avatar_2.svg';
import Avatar3 from '@assets/images/avatars/user/default-avatar_3.svg';
import Avatar4 from '@assets/images/avatars/user/default-avatar_4.svg';
import Avatar5 from '@assets/images/avatars/user/default-avatar_5.svg';
import Avatar6 from '@assets/images/avatars/user/default-avatar_6.svg';
import Avatar7 from '@assets/images/avatars/user/default-avatar_7.svg';
import Avatar8 from '@assets/images/avatars/user/default-avatar_8.svg';
import Avatar9 from '@assets/images/avatars/user/default-avatar_9.svg';
import Avatar10 from '@assets/images/avatars/user/default-avatar_10.svg';
import Avatar11 from '@assets/images/avatars/user/default-avatar_11.svg';
import Avatar12 from '@assets/images/avatars/user/default-avatar_12.svg';
import Avatar13 from '@assets/images/avatars/user/default-avatar_13.svg';
import Avatar14 from '@assets/images/avatars/user/default-avatar_14.svg';
import Avatar15 from '@assets/images/avatars/user/default-avatar_15.svg';
import Avatar16 from '@assets/images/avatars/user/default-avatar_16.svg';
import Avatar17 from '@assets/images/avatars/user/default-avatar_17.svg';
import Avatar18 from '@assets/images/avatars/user/default-avatar_18.svg';
import Avatar19 from '@assets/images/avatars/user/default-avatar_19.svg';
import Avatar20 from '@assets/images/avatars/user/default-avatar_20.svg';
import Avatar21 from '@assets/images/avatars/user/default-avatar_21.svg';
import Avatar22 from '@assets/images/avatars/user/default-avatar_22.svg';
import Avatar23 from '@assets/images/avatars/user/default-avatar_23.svg';
import Avatar24 from '@assets/images/avatars/user/default-avatar_24.svg';

type AvatarComponent = FC<SvgProps>;
type AvatarArray = readonly AvatarComponent[];

const avatars: AvatarArray = [
    Avatar1,
    Avatar2,
    Avatar3,
    Avatar4,
    Avatar5,
    Avatar6,
    Avatar7,
    Avatar8,
    Avatar9,
    Avatar10,
    Avatar11,
    Avatar12,
    Avatar13,
    Avatar14,
    Avatar15,
    Avatar16,
    Avatar17,
    Avatar18,
    Avatar19,
    Avatar20,
    Avatar21,
    Avatar22,
    Avatar23,
    Avatar24,
] as const;

const AVATAR_LENGTH: number = avatars.length;
const DEFAULT_AVATAR: AvatarComponent = Avatar1;

// Prime numbers for better distribution
const MULTIPLIER = AVATAR_LENGTH + 7; // First prime after length
const OFFSET = AVATAR_LENGTH - 11; // First prime before length

/**
 * Generate a deterministic avatar based on multiple letters from the name.
 * Uses a rolling hash of the first 5 letters (or available letters if name is shorter)
 * for better distribution while maintaining deterministic results.
 *
 * @example
 * // These will always return the same avatar for the same name
 * const avatar1 = getAvatarForContact("Jonathan")  // Uses 'Jonat' for hash
 * const avatar2 = getAvatarForContact("Jane")  // Uses 'Jane' for hash
 * const avatar3 = getAvatarForContact("J")     // Uses 'J' for hash
 *
 * @param name - Contact name or null/undefined
 * @returns Avatar component
 */
const getAvatarForContact = (name?: string | null): AvatarComponent => {
    if (!name?.length) {
        return DEFAULT_AVATAR;
    }

    // Take up to first 8 characters, or all if name is shorter
    const chars = name.slice(0, 8);

    // Create a rolling hash from the characters
    let hash = 0;
    for (let i = 0; i < chars.length; i++) {
        const charCode = chars.charCodeAt(i);
        // Use position-based multiplier for better distribution
        hash = (hash * MULTIPLIER + charCode * (i + 1) + OFFSET) % AVATAR_LENGTH;
    }

    return avatars.at(Math.abs(hash)) ?? DEFAULT_AVATAR;
};

export type {AvatarComponent};
export {getAvatarForContact};
