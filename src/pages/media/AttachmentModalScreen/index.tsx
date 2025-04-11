import React, {useContext, useMemo} from 'react';
import SCREENS from '@src/SCREENS';
import type {AttachmentContextProps} from './AttachmentModalContext';
import AttachmentModalContext from './AttachmentModalContext';
import ProfileAvatarModalContent from './routes/ProfileAvatarModalContent';
import ReportAttachmentModalContent from './routes/ReportAttachmentModalContent';
import ReportAvatarModalContent from './routes/ReportAvatarModalContent';
import TransactionReceiptModalContent from './routes/TransactionReceiptModalContent';
import WorkspaceAvatarModalContent from './routes/WorkspaceAvatarModalContent';
import type {AttachmentModalScreenProps} from './types';

/**
 * The attachment modal screen can take various different shapes. This is the main screen component that receives the route and
 * navigation props from the parent screen and renders the correct modal content based on the route.
 */
function AttachmentModalScreen({route, navigation}: AttachmentModalScreenProps) {
    const attachmentsContext = useContext(AttachmentModalContext);
    const params: AttachmentContextProps = useMemo(() => {
        const currentAttachment = attachmentsContext.getCurrentAttachment();

        if (currentAttachment) {
            return {...route.params, ...currentAttachment};
        }
        return route.params;
    }, [attachmentsContext, route.params]);

    if (route.name === SCREENS.ATTACHMENTS) {
        return (
            <ReportAttachmentModalContent
                route={route}
                navigation={navigation}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
            />
        );
    }

    if (route.name === SCREENS.TRANSACTION_RECEIPT) {
        return (
            <TransactionReceiptModalContent
                route={route}
                navigation={navigation}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
            />
        );
    }

    if (route.name === SCREENS.PROFILE_AVATAR) {
        return (
            <ProfileAvatarModalContent
                route={route}
                navigation={navigation}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
            />
        );
    }

    if (route.name === SCREENS.WORKSPACE_AVATAR) {
        return (
            <WorkspaceAvatarModalContent
                route={route}
                navigation={navigation}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
            />
        );
    }

    if (route.name === SCREENS.REPORT_AVATAR) {
        return (
            <ReportAvatarModalContent
                route={route}
                navigation={navigation}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...params}
            />
        );
    }

    return null;
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
