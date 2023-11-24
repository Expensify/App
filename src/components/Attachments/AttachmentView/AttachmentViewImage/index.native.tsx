import React, {memo} from 'react';
import {Role} from 'react-native';
import AttachmentCarouselPage from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPage';
import ImageView from '@components/ImageView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import AttachmentViewImageProps from './types';

function AttachmentViewImage({
    source,
    file = {name: ''},
    isAuthTokenRequired = false,
    isFocused = false,
    isUsedInCarousel = false,
    loadComplete = false,
    onPress = undefined,
    isImage = false,
    onScaleChanged = () => {},
}: AttachmentViewImageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const children = isUsedInCarousel ? (
        <AttachmentCarouselPage
            source={source}
            isAuthTokenRequired={isImage && isAuthTokenRequired}
            file={file}
            isActive={isFocused}
        />
    ) : (
        <ImageView
            onScaleChanged={onScaleChanged}
            url={source}
            fileName={file.name}
            isAuthTokenRequired={isImage && isAuthTokenRequired}
        />
    );

    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            disabled={loadComplete}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON as Role}
            accessibilityLabel={file.name || translate('attachmentView.unknownFilename')}
        >
            {children}
        </PressableWithoutFeedback>
    ) : (
        children
    );
}

AttachmentViewImage.displayName = 'AttachmentViewImage';

export default memo(AttachmentViewImage);
