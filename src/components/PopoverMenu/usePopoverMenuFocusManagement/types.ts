import type BaseModalProps from '@components/Modal/types';

type FocusManagedMenuItem = {
    shouldSkipFocusRestore?: boolean;
    subMenuItems?: FocusManagedMenuItem[];
};

type UsePopoverMenuFocusManagementParams = {
    isVisible: boolean;
    menuItems: FocusManagedMenuItem[];
    restoreFocusType?: BaseModalProps['restoreFocusType'];
    shouldEnableNewFocusManagement?: boolean;
};

type UsePopoverMenuFocusManagementResult = {
    effectiveRestoreFocusType?: BaseModalProps['restoreFocusType'];
    handleModalHide: () => void;
    prepareForSelection: (item: FocusManagedMenuItem) => boolean;
    requestCloseAfterFocusPolicyCommit: (onModalClose: () => void | Promise<void>, shouldCloseAllModals?: boolean) => void;
    shouldUseNewFocusManagement: boolean;
};

export type {FocusManagedMenuItem, UsePopoverMenuFocusManagementParams, UsePopoverMenuFocusManagementResult};
