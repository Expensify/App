import React, {memo} from 'react';
import type AttachmentViewBaseProps from '@components/Attachments/AttachmentView/types';
import ImageView from '@components/ImageView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type AttachmentViewImageProps = {
    url: string | number;

    loadComplete: boolean;

    isImage: boolean;
} & AttachmentViewBaseProps;

function AttachmentViewImage({
    url,
    file,
    isAuthTokenRequired,
    isUsedInCarousel,
    isSingleCarouselItem,
    carouselItemIndex,
    carouselActiveItemIndex,
    loadComplete,
    onPress,
    onError,
    isImage,
}: AttachmentViewImageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const children = (
        <ImageView
            onError={onError}
            url={url}
            fileName={file?.name ?? ''}
            isAuthTokenRequired={isImage && isAuthTokenRequired}
            isUsedInCarousel={isUsedInCarousel}
            isSingleCarouselItem={isSingleCarouselItem}
            carouselItemIndex={carouselItemIndex}
            carouselActiveItemIndex={carouselActiveItemIndex}
        />
    );

    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            disabled={loadComplete}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            accessibilityLabel={file?.name ?? translate('attachmentView.unknownFilename')}
        >
            {children}
        </PressableWithoutFeedback>
    ) : (
        children
    );
}

AttachmentViewImage.displayName = 'AttachmentViewImage';

export default memo(AttachmentViewImage);
