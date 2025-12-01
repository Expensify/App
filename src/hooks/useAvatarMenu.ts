import {useCallback, useContext} from 'react';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';
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
function useAvatarMenu({shouldHideAvatarEdit, accountID, onImageRemoved, showAvatarCropModal, clearError, source, originalFileName}: UseAvatarMenuParams) {
    const icons = useMemoizedLazyExpensifyIcons(['Upload'] as const);
    const {translate} = useLocalize();
    const attachmentContext = useContext(AttachmentModalContext);

    /**
     * Create menu items list for avatar menu
     */
    const createMenuItems = useCallback(
        (openPicker: OpenPicker): Array<DropdownOption<null>> => {
            const menuItems: Array<DropdownOption<null>> = [
                {
                    icon: icons.Upload,
                    text: translate('avatarWithImagePicker.uploadPhoto'),
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
                    icon: Expensicons.Trashcan,
                    text: translate('avatarWithImagePicker.removePhoto'),
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
                    icon: Expensicons.Eye,
                    text: translate('avatarWithImagePicker.viewPhoto'),
                    onSelected: () => {
                        attachmentContext.setCurrentAttachment({source, originalFileName});
                        Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(accountID));
                    },
                },
            ];
        },
        [icons.Upload, translate, shouldHideAvatarEdit, source, showAvatarCropModal, clearError, onImageRemoved, attachmentContext, originalFileName, accountID],
    );

    return {createMenuItems};
}

export default useAvatarMenu;
