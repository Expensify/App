import type {OnyxEntry} from 'react-native-onyx';
import Clipboard from '@libs/Clipboard';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type CopyOnyxDataActionParams = BaseContextMenuActionParams & {
    report: OnyxEntry<Report>;
    copyIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function shouldShowCopyOnyxDataAction({isProduction}: {isProduction: boolean}): boolean {
    return !isProduction;
}

function createCopyOnyxDataAction({report, translate, copyIcon, checkmarkIcon}: CopyOnyxDataActionParams): ContextMenuAction {
    return {
        id: 'copyOnyxData',
        icon: copyIcon,
        text: translate('reportActionContextMenu.copyOnyxData'),
        successText: translate('reportActionContextMenu.copied'),
        successIcon: checkmarkIcon,
        isAnonymousAction: true,
        onPress: () =>
            interceptAnonymousUser(() => {
                Clipboard.setString(JSON.stringify(report, null, 4));
                hideContextMenu(true, ReportActionComposeFocusManager.focus);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_ONYX_DATA,
    };
}

export default createCopyOnyxDataAction;
export {shouldShowCopyOnyxDataAction};
