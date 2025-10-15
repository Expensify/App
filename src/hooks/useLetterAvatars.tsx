import React, {useMemo} from 'react';
import type {SvgProps} from 'react-native-svg';
import ColoredAvatar from '@components/ColoredAvatar';
import {generateLetterAvatars} from '@libs/Avatars/CustomAvatarCatalog';
import type {AvatarSizeName} from '@styles/utils';

type ColoredAvatarComponent = React.FC<SvgProps>;

type LetterAvatarItem = {
    id: string;
    component: ColoredAvatarComponent;
};

type LetterAvatarsResult = {
    /** Array of avatar items for AvatarSelector */
    avatarList: LetterAvatarItem[];
    /** Object mapping avatar IDs to components for AvatarPage */
    avatarMap: Record<string, ColoredAvatarComponent>;
};

type ColoredAvatarProps = {
    Component: React.FC<SvgProps>;
    backgroundColor: string;
    fillColor: string;
    size?: AvatarSizeName;
};

/**
 * Hook to generate letter avatars based on a user's first name initial.
 * Returns both an array (for AvatarSelector) and an object (for AvatarPage).
 *
 * @param firstName - The user's first name
 * @param size - Optional size for the avatars
 * @returns An object containing avatarList and avatarMap
 */
function useLetterAvatars(firstName: string | undefined, size?: AvatarSizeName): LetterAvatarsResult {
    return useMemo(() => {
        const initial = firstName?.charAt(0) ?? '';
        const avatarVariants = generateLetterAvatars(initial);

        const avatarList: LetterAvatarItem[] = [];
        const avatarMap: Record<string, ColoredAvatarComponent> = {};

        avatarVariants.forEach((variant) => {
            // eslint-disable-next-line react/function-component-definition, react/no-unstable-nested-components
            const StyledComponent: React.FC<SvgProps> = () => (
                <ColoredAvatar
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...variant}
                    size={size}
                />
            );

            const id = `workspace-${variant.backgroundColor}-${variant.fillColor}-${initial}`;

            avatarList.push({
                id,
                component: StyledComponent,
            });

            avatarMap[id] = StyledComponent;
        });

        return {
            avatarList,
            avatarMap,
        };
    }, [firstName, size]);
}

export default useLetterAvatars;
export type {LetterAvatarItem, LetterAvatarsResult, ColoredAvatarProps};
