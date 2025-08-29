import React, {useContext, useMemo} from 'react';
import SCREENS from '@src/SCREENS';
import AttachmentModalContext from './AttachmentModalContext';
import ProfileAvatarModalContent from './routes/ProfileAvatarModalContent';
import ReportAttachmentModalContent from './routes/ReportAttachmentModalContent';
import ReportAvatarModalContent from './routes/ReportAvatarModalContent';
import TransactionReceiptModalContent from './routes/TransactionReceiptModalContent';
import WorkspaceAvatarModalContent from './routes/WorkspaceAvatarModalContent';
import type {AttachmentModalScreenProps, AttachmentModalScreenType} from './types';

type RouteType<Screen extends AttachmentModalScreenType> = AttachmentModalScreenProps<Screen>['route'];
type NavigationType<Screen extends AttachmentModalScreenType> = AttachmentModalScreenProps<Screen>['navigation'];

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

    if (route.name === SCREENS.ATTACHMENTS) {
        return (
            <ReportAttachmentModalContent
                route={{...route, params: paramsWithContext} as RouteType<typeof SCREENS.ATTACHMENTS>}
                navigation={navigation as NavigationType<typeof SCREENS.ATTACHMENTS>}
            />
        );
    }

    if (route.name === SCREENS.TRANSACTION_RECEIPT || route.name === SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW) {
        return (
            <TransactionReceiptModalContent
                route={{...route, params: paramsWithContext} as RouteType<typeof SCREENS.TRANSACTION_RECEIPT>}
                navigation={navigation as NavigationType<typeof SCREENS.TRANSACTION_RECEIPT>}
            />
        );
    }

    if (route.name === SCREENS.PROFILE_AVATAR) {
        return (
            <ProfileAvatarModalContent
                route={{...route, params: paramsWithContext} as RouteType<typeof SCREENS.PROFILE_AVATAR>}
                navigation={navigation as NavigationType<typeof SCREENS.PROFILE_AVATAR>}
            />
        );
    }

    if (route.name === SCREENS.WORKSPACE_AVATAR) {
        return (
            <WorkspaceAvatarModalContent
                route={{...route, params: paramsWithContext} as RouteType<typeof SCREENS.WORKSPACE_AVATAR>}
                navigation={navigation as NavigationType<typeof SCREENS.WORKSPACE_AVATAR>}
            />
        );
    }

    if (route.name === SCREENS.REPORT_AVATAR) {
        return (
            <ReportAvatarModalContent
                route={{...route, params: paramsWithContext} as RouteType<typeof SCREENS.REPORT_AVATAR>}
                navigation={navigation as NavigationType<typeof SCREENS.REPORT_AVATAR>}
            />
        );
    }

    return null;
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
