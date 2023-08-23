import React, {useState} from 'react';
import {View} from 'react-native';
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
        /** Whether source URL requires authentication */
        isAuthTokenRequired: PropTypes.bool,

        /** The source (URL) of the attachment */
        source: PropTypes.string,

        /** File additional information of the attachment */
        file: PropTypes.shape({
            /** File name of the attachment */
            name: PropTypes.string,
        }),

        /** Whether the attachment has been flagged */
        hasBeenFlagged: PropTypes.bool,
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
    const [isHidden, setIsHidden] = useState(item.hasBeenFlagged);

    const renderButton = (style) => (
        <Button
            small
            style={style}
            onPress={() => setIsHidden(!isHidden)}
        >
            <Text
                style={styles.buttonSmallText}
                selectable={false}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                {isHidden ? translate('moderation.revealMessage') : translate('moderation.hideMessage')}
            </Text>
        </Button>
    );

    if (isHidden) {
        return (
            <PressableWithoutFeedback
                style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph4]}
                onPress={onPress}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={item.file.name || translate('attachmentView.unknownFilename')}
            >
                <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.lh20]}>{translate('moderation.flaggedContent')}</Text>
                {renderButton([styles.mt2])}
            </PressableWithoutFeedback>
        );
    }

    return (
        <View style={[styles.flex1]}>
            <View style={[styles.flex1]}>
                <AttachmentView
                    source={item.source}
                    file={item.file}
                    isAuthTokenRequired={item.isAuthTokenRequired}
                    isFocused={isFocused}
                    onPress={onPress}
                    isUsedInCarousel
                />
            </View>

            {item.hasBeenFlagged && renderButton([styles.mv4, styles.mh4, styles.alignSelfCenter])}
        </View>
    );
}

CarouselItem.propTypes = propTypes;
CarouselItem.defaultProps = defaultProps;

export default CarouselItem;
