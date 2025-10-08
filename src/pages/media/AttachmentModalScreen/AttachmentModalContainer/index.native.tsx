import React, {memo, useCallback, useContext, useEffect} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import attachmentModalHandler from '@libs/AttachmentModalHandler';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentStateContextProvider from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {AttachmentModalOnCloseOptions} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import type {AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';
import type AttachmentModalContainerProps from './types';

function AttachmentModalContainer<Screen extends AttachmentModalScreenType>({contentProps, navigation, onShow, onClose}: AttachmentModalContainerProps<Screen>) {
    const attachmentsContext = useContext(AttachmentModalContext);
    const testID = typeof contentProps.source === 'string' ? contentProps.source : (contentProps.source?.toString() ?? '');

    const closeScreen = useCallback(
        (options?: AttachmentModalOnCloseOptions) => {
            attachmentsContext.setCurrentAttachment(undefined);

            const close = () => {
                onClose?.();
                Navigation.goBack();
                options?.onAfterClose?.();
            };

            if (options?.shouldCallDirectly) {
                close();
            } else {
                attachmentModalHandler.handleModalClose(close);
            }
        },
        [attachmentsContext, onClose],
    );

    useEffect(() => {
        onShow?.();
    }, [onShow]);

    return (
        <ScreenWrapper
            navigation={navigation}
            testID={`attachment-modal-${testID}`}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <AttachmentStateContextProvider>
                <AttachmentModalBaseContent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...contentProps}
                    onClose={closeScreen}
                />
            </AttachmentStateContextProvider>
        </ScreenWrapper>
    );
}

AttachmentModalContainer.displayName = 'AttachmentModalContainer';

export default memo(AttachmentModalContainer);
