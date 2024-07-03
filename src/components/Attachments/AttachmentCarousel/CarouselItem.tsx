import React, {useContext, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import AttachmentView from '@components/Attachments/AttachmentView';
import type {Attachment} from '@components/Attachments/types';
import Button from '@components/Button';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ReportAttachmentsContext from '@pages/home/report/ReportAttachmentsContext';
import CONST from '@src/CONST';

type CarouselItemProps = {
    /** Attachment required information such as the source and file name */
    item: Attachment;

    /** onPress callback */
    onPress?: () => void;

    /** Whether attachment carousel modal is hovered over */
    isModalHovered?: boolean;

    /** Whether the attachment is currently being viewed in the carousel */
    isFocused: boolean;
};

function CarouselItem({item, onPress, isFocused, isModalHovered}: CarouselItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isAttachmentHidden} = useContext(ReportAttachmentsContext);
    const [isHidden, setIsHidden] = useState(() => (item.reportActionID ? isAttachmentHidden(item.reportActionID) : item.hasBeenFlagged));

    const renderButton = (style: StyleProp<ViewStyle>) => (
        <Button
            small
            style={style}
            onPress={() => setIsHidden(!isHidden)}
        >
            <Text
                style={[styles.buttonSmallText, styles.userSelectNone]}
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
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                accessibilityLabel={item.file?.name || translate('attachmentView.unknownFilename')}
            >
                {children}
            </PressableWithoutFeedback>
        ) : (
            <View style={[styles.attachmentRevealButtonContainer]}>{children}</View>
        );
    }

    return (
        <View style={[styles.flex1]}>
            <View style={[styles.imageModalImageCenterContainer]}>
                <AttachmentView
                    source={item.source}
                    previewSource={item.previewSource}
                    file={item.file}
                    isAuthTokenRequired={item.isAuthTokenRequired}
                    onPress={onPress}
                    transactionID={item.transactionID}
                    reportActionID={item.reportActionID}
                    isHovered={isModalHovered}
                    isFocused={isFocused}
                    duration={item.duration}
                    isUsedInCarousel
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

CarouselItem.displayName = 'CarouselItem';

export default CarouselItem;
