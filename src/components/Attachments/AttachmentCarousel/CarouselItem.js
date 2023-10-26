import React, {useContext, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import useLocalize from '../../../hooks/useLocalize';
import PressableWithoutFeedback from '../../Pressable/PressableWithoutFeedback';
import Text from '../../Text';
import Button from '../../Button';
import AttachmentView from '../AttachmentView';
import SafeAreaConsumer from '../../SafeAreaConsumer';
import ReportAttachmentsContext from '../../../pages/home/report/ReportAttachmentsContext';
import * as AttachmentsPropTypes from '../propTypes';

const propTypes = {
    /** Attachment required information such as the source and file name */
    item: PropTypes.shape({
        /** Report action ID of the attachment */
        reportActionID: PropTypes.string,

        /** Whether source URL requires authentication */
        isAuthTokenRequired: PropTypes.bool,

        /** URL to full-sized attachment or SVG function */
        source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

        /** Additional information about the attachment file */
        file: PropTypes.shape({
            /** File name of the attachment */
            name: PropTypes.string,
        }),

        /** Whether the attachment has been flagged */
        hasBeenFlagged: PropTypes.bool,

        /** The id of the transaction related to the attachment */
        transactionID: PropTypes.string,
    }).isRequired,

    /** Whether the attachment is currently being viewed in the carousel */
    isFocused: PropTypes.bool.isRequired,

    /** onPress callback */
    onPress: PropTypes.func,
};

const defaultProps = {
    onPress: undefined,
};

function CarouselItem({item, isFocused, onPress}) {
    const {translate} = useLocalize();
    const {isAttachmentHidden} = useContext(ReportAttachmentsContext);
    // eslint-disable-next-line es/no-nullish-coalescing-operators
    const [isHidden, setIsHidden] = useState(() => isAttachmentHidden(item.reportActionID) ?? item.hasBeenFlagged);

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
        const children = (
            <>
                <Text style={[styles.textLabelSupporting, styles.textAlignCenter, styles.lh20]}>{translate('moderation.flaggedContent')}</Text>
                {renderButton([styles.mt2])}
            </>
        );
        return onPress ? (
            <PressableWithoutFeedback
                style={[styles.attachmentRevealButtonContainer]}
                onPress={onPress}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                accessibilityLabel={item.file.name || translate('attachmentView.unknownFilename')}
            >
                {children}
            </PressableWithoutFeedback>
        ) : (
            <View style={[styles.attachmentRevealButtonContainer]}>{children}</View>
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
                    transactionID={item.transactionID}
                />
            </View>

            {item.hasBeenFlagged && (
                <SafeAreaConsumer>
                    {({safeAreaPaddingBottomStyle}) => <View style={[styles.appBG, safeAreaPaddingBottomStyle]}>{renderButton([styles.m4, styles.alignSelfCenter])}</View>}
                </SafeAreaConsumer>
            )}
        </View>
    );
}

CarouselItem.propTypes = propTypes;
CarouselItem.defaultProps = defaultProps;

export default CarouselItem;
