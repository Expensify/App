import React, {memo} from 'react';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import ImageView from '../../ImageView';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import compose from '../../../libs/compose';
import PressableWithoutFeedback from '../../Pressable/PressableWithoutFeedback';
import CONST from '../../../CONST';
import AttachmentCarouselPage from '../../AttachmentCarouselPager/AttachmentCarouselPage';
import * as AttachmentsPropTypes from '../../Attachments/propTypes';

const propTypes = {
    item: AttachmentsPropTypes.attachmentPropType,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Handles scale changed event */
    onScaleChanged: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    item: {
        isAuthTokenRequired: false,
        file: {
            name: '',
        },
    },
    onPress: undefined,
    onScaleChanged: () => {},
};

function AttachmentViewImage({item, loadComplete, onPress, isImage, onScaleChanged, translate}) {
    const children = (
        <AttachmentCarouselPage>
            <ImageView
                onScaleChanged={onScaleChanged}
                url={item.source}
                fileName={item.file.name}
                isAuthTokenRequired={isImage && item.isAuthTokenRequired}
            />
        </AttachmentCarouselPage>
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
AttachmentViewImage.defaultProps = defaultProps;

export default compose(memo, withLocalize)(AttachmentViewImage);
