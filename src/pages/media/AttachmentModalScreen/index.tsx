import React, {useContext, useMemo} from 'react';
import SCREENS from '@src/SCREENS';
import AttachmentModalContext from './AttachmentModalContext';
import ReportAttachmentModalContent from './routes/ReportAttachmentModalContent';
import type {AttachmentModalScreenParams, AttachmentModalScreenProps} from './types';

/**
 * The attachment modal screen can take various different shapes. This is the main screen component that receives the route and
 * navigation props from the parent screen and renders the correct modal content based on the route.
 */
function AttachmentModalScreen({route, navigation}: AttachmentModalScreenProps) {
    const attachmentsContext = useContext(AttachmentModalContext);
    const paramsWithContext: AttachmentModalScreenParams = useMemo(() => {
        const currentAttachment = attachmentsContext.getCurrentAttachment();

        if (currentAttachment) {
            return {...route.params, ...currentAttachment};
        }
        return route.params;
    }, [attachmentsContext, route.params]);

    if (route.name === SCREENS.ATTACHMENTS) {
        return (
            <ReportAttachmentModalContent
                route={{...route, params: paramsWithContext}}
                navigation={navigation}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...paramsWithContext}
            />
        );
    }

    return null;
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
