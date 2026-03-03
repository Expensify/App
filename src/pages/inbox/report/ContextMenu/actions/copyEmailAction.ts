import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createCopyEmailAction(params: ContextMenuActionParams): ActionDescriptor {
    const {selection, interceptAnonymousUser, translate} = params.payload;
    const {Copy, Checkmark} = params.icons;

    return {
        id: 'copyEmail',
        icon: Copy,
        text: translate('reportActionContextMenu.copyEmailToClipboard'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: Checkmark,
        description: EmailUtils.prefixMailSeparatorsWithBreakOpportunities(EmailUtils.trimMailTo(selection ?? '')),
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                Clipboard.setString(EmailUtils.trimMailTo(selection));
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_EMAIL,
    };
}

export default createCopyEmailAction;
