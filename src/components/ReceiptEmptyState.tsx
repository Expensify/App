import useFilesValidation from '@hooks/useFilesValidation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import AttachmentPicker from './AttachmentPicker';
import Icon from './Icon';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import ReceiptAlternativeMethods from './ReceiptAlternativeMethods';
import Text from './Text';

type ReceiptEmptyStateProps = {
    /** Callback to be called on onPress */
    onPress?: () => void;

    /** Whether the receipt action is disabled */
    disabled?: boolean;

    /** Whether the receipt is a thumbnail */
    isThumbnail?: boolean;

    /** Whether the receipt is in the money request view */
    isInMoneyRequestView?: boolean;

    /** Whether the receipt empty state should extend to the full height of the container. */
    shouldUseFullHeight?: boolean;

    style?: StyleProp<ViewStyle>;

    /** Callback to be called when the image loads */
    onLoad?: () => void;

    /** Whether it's displayed in Wide RHP */
    isDisplayedInWideRHP?: boolean;

    /** Callback to be called when a receipt is selected */
    setReceiptFile?: (files: FileObject[]) => void;
};

function ReceiptPlaceholderPlusIcon({circleFill, plusFill, size}: {circleFill: string; plusFill: string; size: number}) {
    return (
        <Svg
            viewBox="0 0 28 28"
            width={size}
            height={size}
        >
            <Path
                d="M0 14C0 6.268 6.268 0 14 0s14 6.268 14 14-6.268 14-14 14S0 21.732 0 14"
                fill={circleFill}
            />
            <Path
                d="M15.2 18.2a1.2 1.2 0 1 1-2.4 0v-3h-3a1.2 1.2 0 1 1 0-2.4h3v-3a1.2 1.2 0 1 1 2.4 0v3h3a1.2 1.2 0 1 1 0 2.4h-3z"
                fill={plusFill}
            />
        </Svg>
    );
}

// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState({
    onPress,
    disabled = false,
    isThumbnail = false,
    isInMoneyRequestView = false,
    shouldUseFullHeight = false,
    style,
    onLoad,
    isDisplayedInWideRHP = false,
    setReceiptFile = () => {},
}: ReceiptEmptyStateProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();
    const isLoadedRef = useRef(false);
    const icons = useMemoizedLazyExpensifyIcons(['Receipt']);

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation(setReceiptFile);

    const Wrapper = onPress ? PressableWithoutFeedback : View;
    const containerStyle = [
        styles.alignItemsCenter,
        styles.justifyContentCenter,
        styles.moneyRequestViewImage,
        isDisplayedInWideRHP && !disabled && styles.pb5,
        isThumbnail && !isInMoneyRequestView ? styles.moneyRequestAttachReceiptThumbnail : styles.moneyRequestAttachReceipt,
        shouldUseFullHeight && styles.receiptEmptyStateFullHeight,
        style,
    ];

    useEffect(() => {
        if (isLoadedRef.current) {
            return;
        }
        isLoadedRef.current = true;
        onLoad?.();
    }, [onLoad]);

    return (
        <AttachmentPicker acceptedFileTypes={[...CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS]}>
            {({openPicker}) => (
                <Wrapper
                    accessibilityRole="imagebutton"
                    accessibilityLabel={translate('receipt.upload')}
                    onPress={() => {
                        if (isDisplayedInWideRHP) {
                            openPicker({
                                onPicked: validateFiles,
                            });
                            return;
                        }
                        onPress?.();
                    }}
                    disabled={disabled}
                    disabledStyle={styles.cursorDefault}
                    style={containerStyle}
                >
                    {PDFValidationComponent}
                    {ErrorModal}
                    <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                            <View style={styles.pRelative}>
                                <Icon
                                    fill={theme.border}
                                    src={icons.Receipt}
                                    width={variables.eReceiptEmptyIconWidth}
                                    height={variables.eReceiptEmptyIconWidth}
                                />
                                {!isThumbnail && (
                                    <View style={[styles.moneyRequestAttachReceiptThumbnailIcon, StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.SMALL))]}>
                                        <ReceiptPlaceholderPlusIcon
                                            circleFill={theme.success}
                                            plusFill={theme.receiptPlaceholderPlus}
                                            size={StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.SMALL)}
                                        />
                                    </View>
                                )}
                            </View>
                            {!isThumbnail && isDisplayedInWideRHP && (
                                <>
                                    <Text style={[styles.textHeadline, styles.mt4]}>{translate('receipt.addAReceipt.phrase1')}</Text>
                                    <Text style={[styles.textSupporting, styles.textNormal]}>{translate('receipt.addAReceipt.phrase2')}</Text>
                                </>
                            )}
                        </View>
                    </View>
                    {isDisplayedInWideRHP && !disabled && <ReceiptAlternativeMethods />}
                </Wrapper>
            )}
        </AttachmentPicker>
    );
}

export default ReceiptEmptyState;
