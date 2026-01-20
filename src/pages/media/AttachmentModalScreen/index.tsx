import React, {useContext, useMemo} from 'react';
import Log from '@libs/Log';
import SCREENS from '@src/SCREENS';
import AttachmentModalContext from './AttachmentModalContext';
import ProfileAvatarModalContent from './routes/ProfileAvatarModalContent';
import ReportAddAttachmentModalContent from './routes/report/ReportAddAttachmentModalContent';
import ReportAttachmentModalContent from './routes/report/ReportAttachmentModalContent';
import ReportAvatarModalContent from './routes/report/ReportAvatarModalContent';
import ShareDetailsAttachmentModalContent from './routes/ShareDetailsAttachmentModalContent';
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
    const routeWithContext = useMemo(() => {
        const currentAttachment = attachmentsContext.getCurrentAttachment<Screen>();

        if (currentAttachment) {
            return {...route, params: {...route.params, ...currentAttachment}};
        }
        return route;
    }, [attachmentsContext, route]);

    if (route.name === SCREENS.REPORT_ATTACHMENTS) {
        return (
            <ReportAttachmentModalContent
                route={routeWithContext as RouteType<typeof SCREENS.REPORT_ATTACHMENTS>}
                navigation={navigation as NavigationType<typeof SCREENS.REPORT_ATTACHMENTS>}
            />
        );
    }

    if (route.name === SCREENS.REPORT_ADD_ATTACHMENT) {
        return (
            <ReportAddAttachmentModalContent
                route={routeWithContext as RouteType<typeof SCREENS.REPORT_ADD_ATTACHMENT>}
                navigation={navigation as NavigationType<typeof SCREENS.REPORT_ADD_ATTACHMENT>}
            />
        );
    }

    if (route.name === SCREENS.TRANSACTION_RECEIPT || route.name === SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW) {
        return (
            <TransactionReceiptModalContent
                route={routeWithContext as RouteType<typeof SCREENS.TRANSACTION_RECEIPT>}
                navigation={navigation as NavigationType<typeof SCREENS.TRANSACTION_RECEIPT>}
            />
        );
    }

    if (route.name === SCREENS.PROFILE_AVATAR) {
        return (
            <ProfileAvatarModalContent
                route={routeWithContext as RouteType<typeof SCREENS.PROFILE_AVATAR>}
                navigation={navigation as NavigationType<typeof SCREENS.PROFILE_AVATAR>}
            />
        );
    }

    if (route.name === SCREENS.WORKSPACE_AVATAR) {
        return (
            <WorkspaceAvatarModalContent
                route={routeWithContext as RouteType<typeof SCREENS.WORKSPACE_AVATAR>}
                navigation={navigation as NavigationType<typeof SCREENS.WORKSPACE_AVATAR>}
            />
        );
    }

    if (route.name === SCREENS.REPORT_AVATAR) {
        return (
            <ReportAvatarModalContent
                route={routeWithContext as RouteType<typeof SCREENS.REPORT_AVATAR>}
                navigation={navigation as NavigationType<typeof SCREENS.REPORT_AVATAR>}
            />
        );
    }

    if (route.name === SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT) {
        return (
            <ShareDetailsAttachmentModalContent
                route={routeWithContext as RouteType<typeof SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT>}
                navigation={navigation as NavigationType<typeof SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT>}
            />
        );
    }

    Log.warn('Unknown attachment modal screen. Make sure to add the new screen as a route to the AttachmentModalScreen component.', {route});

    return null;
}

export default AttachmentModalScreen;
