import React, {memo} from 'react';
import styles from '../../../../styles/styles';
import ImageView from '../../../ImageView';
import withLocalize, {withLocalizePropTypes} from '../../../withLocalize';
import compose from '../../../../libs/compose';
import PressableWithoutFeedback from '../../../Pressable/PressableWithoutFeedback';
import CONST from '../../../../CONST';
import {attachmentViewImagePropTypes, attachmentViewImageDefaultProps} from './propTypes';

const propTypes = {
    ...attachmentViewImagePropTypes,
    ...withLocalizePropTypes,
};

function AttachmentViewImage({source, file, isAuthTokenRequired, loadComplete, onPress, isImage, onScaleChanged, translate}) {
    const children = (
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

export default compose(memo, withLocalize)(AttachmentViewImage);
