import React, {memo} from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalContent/BaseContent';
import type {AttachmentModalWrapperProps} from './types';

function AttachmentModalWrapper({contentProps, navigation}: AttachmentModalWrapperProps) {
    const testID = typeof contentProps.source === 'string' ? contentProps.source : contentProps.source?.toString() ?? '';

    return (
        <ScreenWrapper
            navigation={navigation}
            testID={`attachment-modal-${testID}`}
        >
            <AttachmentModalBaseContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...contentProps}
            />
        </ScreenWrapper>
    );
}

AttachmentModalWrapper.displayName = 'AttachmentModalWrapper';

export default memo(AttachmentModalWrapper);
