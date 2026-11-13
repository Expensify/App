import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';

import {useContext} from 'react';

import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';

type OpenPicker = (options: {onPicked: (files: FileObject[]) => void}) => void;

type UseAvatarMenuParams = {
    /** Whether the user is using a default avatar */
    shouldHideAvatarEdit: boolean;
    /** Source of newly uploaded avatar */
    source?: string;
    /** File name of newly uploaded avatar */
    originalFileName?: string;
    /** Account ID for navigation */
    accountID: number;
    onImageRemoved: () => void;
    showAvatarCropModal: (image: FileObject) => void;
    clearError: () => void;
};

/**
 * Custom hook to create avatar menu items
 */
function useAvatarMenu({shouldHideAvatarEdit, accountID, onImageRemoved, showAvatarCropModal, clearError, source, originalFileName}: UseAvatarMenuParams) {
    const icons = useMemoizedLazyExpensifyIcons(['Upload', 'Trashcan', 'Eye']);
    const {translate} = useLocalize();
    const attachmentContext = useContext(AttachmentModalContext);

    /**
     * Create menu items list for avatar menu
     */
    const createMenuItems = (openPicker: OpenPicker): Array<DropdownOption<null>> => {
        const menuItems: Array<DropdownOption<null>> = [
            {
                icon: icons.Upload,
                text: translate('avatarWithImagePicker.uploadPhoto'),
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_PROFILE.AVATAR_EDIT_MENU_UPLOAD_PHOTO,
                onSelected: () => {
                    openPicker({
                        onPicked: (data) => showAvatarCropModal(data.at(0) ?? {}),
                    });
                },
                value: null,
            },
        ];
        // If current avatar is a default avatar and for avatar is selected in the form, only show upload option
        if (shouldHideAvatarEdit) {
            return menuItems;
        }
        if (!source) {
            menuItems.push({
                icon: icons.Trashcan,
                text: translate('avatarWithImagePicker.removePhoto'),
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_PROFILE.AVATAR_EDIT_MENU_REMOVE_PHOTO,
                value: null,
                onSelected: () => {
                    clearError();
                    onImageRemoved();
                },
            });
        }

        return [
            ...menuItems,
            {
                value: null,
                icon: icons.Eye,
                text: translate('avatarWithImagePicker.viewPhoto'),
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_PROFILE.AVATAR_EDIT_MENU_VIEW_PHOTO,
                onSelected: () => {
                    attachmentContext.setCurrentAttachment({source, originalFileName});
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE_AVATAR.getRoute(accountID)));
                },
            },
        ];
    };

    return {createMenuItems};
}

export default useAvatarMenu;
