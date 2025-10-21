import {useCallback} from 'react';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import * as Expensicons from '@components/Icon/Expensicons';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';
import useLocalize from './useLocalize';

type OpenPicker = (options: {onPicked: (files: FileObject[]) => void}) => void;

type UseAvatarMenuParams = {
    /** Whether the user is using a default avatar */
    isUsingDefaultAvatar: boolean;
    /** Whether the user has chosen a new avatar in the form  but hasn't uploaded it yet */
    isAvatarSelected: boolean;
    /** Account ID for navigation */
    accountID: number;
    /** Callback when avatar is removed */
    onImageRemoved: () => void;
    /** Callback to show avatar crop modal */
    showAvatarCropModal: (image: FileObject) => void;
    /** Callback to clear errors */
    clearError: () => void;
};

/**
 * Custom hook to create avatar menu items
 */
function useAvatarMenu({isUsingDefaultAvatar, isAvatarSelected, accountID, onImageRemoved, showAvatarCropModal, clearError}: UseAvatarMenuParams) {
    const {translate} = useLocalize();

    /**
     * Create menu items list for avatar menu
     */
    const createMenuItems = useCallback(
        (openPicker: OpenPicker): Array<DropdownOption<null>> => {
            const menuItems: Array<DropdownOption<null>> = [
                {
                    icon: Expensicons.Upload,
                    text: translate('avatarWithImagePicker.uploadPhoto'),
                    onSelected: () => {
                        openPicker({
                            onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                        });
                    },
                    value: null,
                },
            ];
            // If current avatar is a default avatar and for no avatar is selected in the form, only show upload option
            if (isUsingDefaultAvatar && !isAvatarSelected) {
                return menuItems;
            }
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('avatarWithImagePicker.removePhoto'),
                value: null,
                onSelected: () => {
                    clearError();
                    onImageRemoved();
                },
            });
            // If an avatar is selected in the form do NOT show view photo
            if (isAvatarSelected) {
                return menuItems;
            }
            return [
                ...menuItems,
                {
                    value: null,
                    icon: Expensicons.Eye,
                    text: translate('avatarWithImagePicker.viewPhoto'),
                    onSelected: () => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(accountID)),
                },
            ];
        },
        [accountID, isUsingDefaultAvatar, onImageRemoved, showAvatarCropModal, translate, clearError, isAvatarSelected],
    );

    return {createMenuItems};
}

export default useAvatarMenu;
