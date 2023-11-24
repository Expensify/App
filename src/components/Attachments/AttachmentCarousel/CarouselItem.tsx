import React, {useContext, useState} from 'react';
import {Role, StyleProp, View, ViewStyle} from 'react-native';
import AttachmentView from '@components/Attachments/AttachmentView';
import Button from '@components/Button';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import ReportAttachmentsContext from '@pages/home/report/ReportAttachmentsContext';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

type Attachment = {
    reportActionID?: string;
    source: string;
    isAuthTokenRequired: boolean;
    file: {name: string};
    isReceipt: boolean;
    hasBeenFlagged?: boolean;
    transactionID?: string;
};

type CarouselItemProps = {
    /** Attachment required information such as the source and file name */
    item: Attachment;

    /** Whether the attachment is currently being viewed in the carousel */
    isFocused: boolean;

    /** onPress callback */
    onPress?: () => void;
};

function CarouselItem({item, isFocused, onPress = undefined}: CarouselItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isAttachmentHidden} = useContext(ReportAttachmentsContext);
    const [isHidden, setIsHidden] = useState<boolean>(() => isAttachmentHidden(item.reportActionID) ?? item.hasBeenFlagged);

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
                role={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON as Role}
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

CarouselItem.displayName = 'CarouselItem';

export default CarouselItem;
export type {Attachment};
