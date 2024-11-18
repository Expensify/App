import SCREENS from '@src/SCREENS';

function isNavigatingToAttachmentScreen(focusedRouteName?: string) {
    return focusedRouteName === SCREENS.ATTACHMENTS;
}

export default isNavigatingToAttachmentScreen;
