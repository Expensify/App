import React, {memo} from 'react';
import styles from '../../../../styles/styles';
import ImageView from '../../../ImageView';
import withLocalize, {withLocalizePropTypes} from '../../../withLocalize';
import compose from '../../../../libs/compose';
import PressableWithoutFeedback from '../../../Pressable/PressableWithoutFeedback';
import CONST from '../../../../CONST';
import {attachmentViewPropTypes, attachmentViewDefaultProps} from '../propTypes';

const propTypes = {
    ...attachmentViewPropTypes,
    ...withLocalizePropTypes,
};

function AttachmentViewImage({item, loadComplete, onPress, isImage, onScaleChanged, translate}) {
    const children = (
        <ImageView
            onScaleChanged={onScaleChanged}
            url={item.source}
            fileName={item.file.name}
            isAuthTokenRequired={isImage && item.isAuthTokenRequired}
        />
    );
    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            disabled={loadComplete}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            accessibilityLabel={item.file.name || translate('attachmentView.unknownFilename')}
        >
            {children}
        </PressableWithoutFeedback>
    ) : (
        children
    );
}

AttachmentViewImage.propTypes = propTypes;
AttachmentViewImage.defaultProps = attachmentViewDefaultProps;

export default compose(memo, withLocalize)(AttachmentViewImage);
