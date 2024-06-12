import React, {memo} from 'react';
import ImageView from '@components/ImageView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {AttachmentViewProps} from '..';

type AttachmentViewImageProps = Pick<AttachmentViewProps, 'isAuthTokenRequired' | 'file' | 'onPress'> & {
    url: string;

    loadComplete: boolean;

    isImage: boolean;

    /** Function for handle on error */
    onError?: () => void;

    /** Function for handle on close */
    onClose?: () => void;
};

function AttachmentViewImage({url, file, isAuthTokenRequired, loadComplete, onPress, onError, onClose, isImage}: AttachmentViewImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const children = (
        <ImageView
            onError={onError}
            onSwipeDown={onClose}
            url={url}
            fileName={file?.name ?? ''}
            isAuthTokenRequired={isImage && isAuthTokenRequired}
        />
    );

    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            disabled={loadComplete}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            accessibilityLabel={file?.name || translate('attachmentView.unknownFilename')}
        >
            {children}
        </PressableWithoutFeedback>
    ) : (
        children
    );
}

AttachmentViewImage.displayName = 'AttachmentViewImage';

export default memo(AttachmentViewImage);
