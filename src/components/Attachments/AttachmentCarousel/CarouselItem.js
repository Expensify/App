import React, {useState} from 'react';
import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import useLocalize from '../../../hooks/useLocalize';
import PressableWithoutFeedback from '../../Pressable/PressableWithoutFeedback';
import Text from '../../Text';
import Button from '../../Button';
import AttachmentView from '../AttachmentView';

const propTypes = {
    /** Attachment required information such as the source and file name */
    item: PropTypes.shape({
        isAuthTokenRequired: PropTypes.bool,
        source: PropTypes.string,
        file: PropTypes.shape({name: PropTypes.string}),
        isHidden: PropTypes.bool,
    }).isRequired,

    /** Whether the attachment is currently being viewed in the carousel */
    isFocused: PropTypes.bool.isRequired,

    /** onPress callback */
    onPress: PropTypes.func,
};

const defaultProps = {
    onPress: () => {},
};

function CarouselItem({item, isFocused, onPress}) {
    const {translate} = useLocalize();
    const [isHidden, setIsHidden] = useState(item.isHidden);

    if (isHidden) {
        return (
            <PressableWithoutFeedback
                style={[styles.w100, styles.h100, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph4]}
                onPress={onPress}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={item.file.name || translate('attachmentView.unknownFilename')}
            >
                <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.lh20]}>{translate('moderation.flaggedContent')}</Text>
                <Button
                    small
                    style={[styles.mt2]}
                    onPress={() => setIsHidden(false)}
                >
                    <Text
                        style={styles.buttonSmallText}
                        selectable={false}
                    >
                        {translate('moderation.revealMessage')}
                    </Text>
                </Button>
            </PressableWithoutFeedback>
        );
    }

    return (
        <AttachmentView
            source={item.source}
            file={item.file}
            isAuthTokenRequired={item.isAuthTokenRequired}
            isFocused={isFocused}
            onPress={onPress}
            isUsedInCarousel
        />
    );
}

CarouselItem.propTypes = propTypes;
CarouselItem.defaultProps = defaultProps;

export default CarouselItem;
