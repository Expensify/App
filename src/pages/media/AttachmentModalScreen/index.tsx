import React, {useContext, useMemo} from 'react';
import SCREENS from '@src/SCREENS';
import AttachmentModalContext from './AttachmentModalContext';
import ProfileAvatarModalContent from './routes/ProfileAvatarModalContent';
import ReportAttachmentModalContent from './routes/ReportAttachmentModalContent';
import ReportAvatarModalContent from './routes/ReportAvatarModalContent';
import TransactionReceiptModalContent from './routes/TransactionReceiptModalContent';
import WorkspaceAvatarModalContent from './routes/WorkspaceAvatarModalContent';
import type {AttachmentModalScreenProps} from './types';

type RouteType<Screen extends AttachmentModalScreenType> = AttachmentModalScreenProps<Screen>['route'];
type NavigationType<Screen extends AttachmentModalScreenType> = AttachmentModalScreenProps<Screen>['navigation'];

const ATTACHMENT_MODAL_SCREENS = {
    [SCREENS.ATTACHMENTS]: ReportAttachmentModalContent,
    [SCREENS.REPORT_AVATAR]: ReportAvatarModalContent,
    [SCREENS.PROFILE_AVATAR]: ProfileAvatarModalContent,
    [SCREENS.WORKSPACE_AVATAR]: WorkspaceAvatarModalContent,
    [SCREENS.TRANSACTION_RECEIPT]: TransactionReceiptModalContent,
    [SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW]: TransactionReceiptModalContent,
};
const ATTACHMENT_MODAL_SCREEN_ENTRIES = Object.entries(ATTACHMENT_MODAL_SCREENS);

type AttachmentModalScreenType = keyof typeof ATTACHMENT_MODAL_SCREENS;

/**
 * The attachment modal screen can take various different shapes. This is the main screen component that receives the route and
 * navigation props from the parent screen and renders the correct modal content based on the route.
 */
function AttachmentModalScreen<Screen extends AttachmentModalScreenType>({route, navigation}: AttachmentModalScreenProps<Screen>) {
    const attachmentsContext = useContext(AttachmentModalContext);

    const paramsWithContext = useMemo(() => {
        const currentAttachment = attachmentsContext.getCurrentAttachment<Screen>();

        if (currentAttachment) {
            return {...route.params, ...currentAttachment};
        }
        return route.params;
    }, [attachmentsContext, route.params]);

    const ModalContent = ATTACHMENT_MODAL_SCREEN_ENTRIES.find(([screenName]) => screenName === route.name)?.[1];

    if (!ModalContent) {
        return null;
    }

    type ModalContentType = React.FC<{route: RouteType<typeof route.name>; navigation: NavigationType<typeof route.name>}>;
    const Content = ModalContent as ModalContentType;

    return (
        <Content
            route={{...route, params: paramsWithContext} as RouteType<typeof route.name>}
            navigation={navigation as NavigationType<typeof route.name>}
        />
    );
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
export type {AttachmentModalScreenType};
