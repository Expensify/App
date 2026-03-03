import Clipboard from '@libs/Clipboard';
import EmailUtils from '@libs/EmailUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type CopyEmailActionParams = BaseContextMenuActionParams & {
    selection: string;
    copyIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function createCopyEmailAction({selection, translate, copyIcon, checkmarkIcon}: CopyEmailActionParams): ContextMenuAction {
    return {
        id: 'copyEmail',
        icon: copyIcon,
        text: translate('reportActionContextMenu.copyEmailToClipboard'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: checkmarkIcon,
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
