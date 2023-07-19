import React, {memo} from 'react';
import styles from '../../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../withLocalize';
import ImageView from '../../../ImageView';
import compose from '../../../../libs/compose';
import PressableWithoutFeedback from '../../../Pressable/PressableWithoutFeedback';
import CONST from '../../../../CONST';
import AttachmentCarouselPage from '../../AttachmentCarouselPager/AttachmentCarouselPage';
import {attachmentViewPropTypes, attachmentViewDefaultProps} from '../propTypes';

const propTypes = {
    ...attachmentViewPropTypes,
    ...withLocalizePropTypes,
};

function AttachmentViewImage({item, loadComplete, onPress, isImage, isUsedInCarousel, onScaleChanged, translate}) {
    const children = isUsedInCarousel ? (
        <AttachmentCarouselPage
            item={item}
            isAuthTokenRequired={isImage && item.isAuthTokenRequired}
        />
    ) : (
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
