import React, {memo} from 'react';
import ImageView from '@components/ImageView';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import CONST from '@src/CONST';
import {attachmentViewImageDefaultProps, attachmentViewImagePropTypes} from './propTypes';

const propTypes = {
    ...attachmentViewImagePropTypes,
    ...withLocalizePropTypes,
};

function AttachmentViewImage({url, file, isAuthTokenRequired, isFocused, loadComplete, onPress, onError, isImage, translate}) {
    const styles = useThemeStyles();
    const children = (
        <ImageView
            onError={onError}
            url={url}
            fileName={file.name}
            isAuthTokenRequired={isImage && isAuthTokenRequired}
            isFocused={isFocused}
        />
    );

    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            disabled={loadComplete}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            accessibilityLabel={file.name || translate('attachmentView.unknownFilename')}
        >
            {children}
        </PressableWithoutFeedback>
    ) : (
        children
    );
}

AttachmentViewImage.propTypes = propTypes;
AttachmentViewImage.defaultProps = attachmentViewImageDefaultProps;
AttachmentViewImage.displayName = 'AttachmentViewImage';

export default compose(memo, withLocalize)(AttachmentViewImage);
