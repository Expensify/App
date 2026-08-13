import type useConfirmModal from '@hooks/useConfirmModal';

import CONST from '@src/CONST';

import getPlatform from './getPlatform';
import TransitionTracker from './Navigation/TransitionTracker';

type ShowConfirmModal = ReturnType<typeof useConfirmModal>['showConfirmModal'];
type ShowConfirmModalOptions = Parameters<ShowConfirmModal>[0];
type ShowConfirmModalResult = Awaited<ReturnType<ShowConfirmModal>>;

/** More menu items call this after the popover dismisses; on iOS defer until interactions finish so the confirm modal can present. */
function showConfirmModalAfterMoreMenuDismiss(showConfirmModal: ShowConfirmModal, options: ShowConfirmModalOptions): Promise<ShowConfirmModalResult> {
    if (getPlatform() !== CONST.PLATFORM.IOS) {
        return showConfirmModal(options);
    }

    return new Promise((resolve) => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                showConfirmModal(options).then(resolve);
            },
            waitForUpcomingTransition: true,
        });
    });
}

export default showConfirmModalAfterMoreMenuDismiss;
