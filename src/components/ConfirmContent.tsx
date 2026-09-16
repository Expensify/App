import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ButtonVariant} from '@styles/utils/types';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import ActivityIndicator from './ActivityIndicator';
import Button from './Button';
import HeaderTitle from './HeaderTitle';
import Icon from './Icon';
import ImageSVG from './ImageSVG';
import {PressableWithoutFeedback} from './Pressable';
import ScrollView from './ScrollView';
import Text from './Text';
import Tooltip from './Tooltip';

type ConfirmContentProps = {
    /** Title of the modal */
    title: string;

    /** A callback to call when the form has been submitted */
    onConfirm: () => void;

    /** A callback to call when the form has been closed */
    onCancel?: () => void;

    /** Confirm button text */
    confirmText?: string;

    /** Cancel button text */
    cancelText?: string;

    /** Modal content text/element */
    prompt?: string | ReactNode;

    /** Subtitle shown between the title and the prompt. Stays fixed above the prompt when the prompt is scrollable. */
    subtitle?: string | ReactNode;

    buttonVariant?: ButtonVariant;
    shouldDisableConfirmButtonWhenOffline?: boolean;
    shouldShowCancelButton?: boolean;

    /** Icon to display above the title */
    iconSource?: IconAsset;

    /** Fill color for the Icon */
    iconFill?: string | false;

    iconWidth?: number;
    iconHeight?: number;
    shouldCenterIcon?: boolean;

    /** Whether to center the icon / text content */
    shouldCenterContent?: boolean;

    shouldShowDismissIcon?: boolean;
    shouldStackButtons?: boolean;
    shouldReverseStackedButtons?: boolean;
    titleStyles?: StyleProp<TextStyle>;
    titleContainerStyles?: StyleProp<ViewStyle>;
    promptStyles?: StyleProp<TextStyle>;
    subtitleStyles?: StyleProp<TextStyle>;
    contentStyles?: StyleProp<ViewStyle>;
    iconAdditionalStyles?: StyleProp<ViewStyle>;
    image?: IconAsset;
    imageStyles?: StyleProp<ViewStyle>;
    imageWidth?: number;
    imageHeight?: number;
    shouldFitImageToContainer?: boolean;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Whether the confirm button is loading */
    isConfirmLoading?: boolean;

    /** Whether to show a loading indicator next to the title */
    isTitleLoading?: boolean;

    /** Whether the prompt should be scrollable when it is taller than the screen (e.g. a long list of items) */
    shouldEnablePromptScroll?: boolean;

    /** Force the confirm button to use the success style even when no cancel button is shown */
    shouldUseSuccessStyleForConfirm?: boolean;
};

function ConfirmContent({
    title,
    onConfirm,
    onCancel = () => {},
    confirmText = '',
    cancelText = '',
    prompt = '',
    subtitle,
    subtitleStyles,
    buttonVariant = CONST.BUTTON_VARIANT.SUCCESS,
    shouldDisableConfirmButtonWhenOffline = false,
    shouldShowCancelButton = false,
    iconSource,
    iconFill,
    shouldCenterContent = false,
    shouldStackButtons = true,
    titleStyles,
    promptStyles,
    contentStyles,
    iconAdditionalStyles,
    iconWidth = variables.appModalAppIconSize,
    iconHeight = variables.appModalAppIconSize,
    shouldCenterIcon = false,
    shouldShowDismissIcon = false,
    image,
    imageStyles,
    imageWidth,
    imageHeight,
    shouldFitImageToContainer = false,
    titleContainerStyles,
    shouldReverseStackedButtons = false,
    isVisible,
    isConfirmLoading,
    isTitleLoading = false,
    shouldEnablePromptScroll = false,
    shouldUseSuccessStyleForConfirm = false,
}: ConfirmContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Close']);
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: true});

    const isCentered = shouldCenterContent;

    let confirmButtonVariant: ButtonVariant | undefined;
    if (buttonVariant === CONST.BUTTON_VARIANT.DANGER) {
        confirmButtonVariant = CONST.BUTTON_VARIANT.DANGER;
    } else if ((shouldUseSuccessStyleForConfirm || shouldShowCancelButton) && buttonVariant === CONST.BUTTON_VARIANT.SUCCESS) {
        confirmButtonVariant = CONST.BUTTON_VARIANT.SUCCESS;
    }

    const promptContent = typeof prompt === 'string' ? <Text style={[promptStyles, isCentered ? styles.textAlignCenter : {}]}>{prompt}</Text> : prompt;
    // Rendered outside the (optionally scrollable) prompt so it stays fixed above the prompt.
    let subtitleContent: ReactNode = subtitle;
    if (typeof subtitle === 'string') {
        subtitleContent = <Text style={[styles.mb4, subtitleStyles, isCentered ? styles.textAlignCenter : {}]}>{subtitle}</Text>;
    }

    return (
        <>
            {!!image && (
                <View style={imageStyles}>
                    <ImageSVG
                        contentFit={shouldFitImageToContainer ? 'cover' : 'contain'}
                        src={image}
                        height={imageHeight ?? CONST.CONFIRM_CONTENT_SVG_SIZE.HEIGHT}
                        width={imageWidth ?? (shouldFitImageToContainer ? '100%' : CONST.CONFIRM_CONTENT_SVG_SIZE.WIDTH)}
                        preserveAspectRatio={shouldFitImageToContainer ? 'xMidYMid slice' : undefined}
                        style={styles.alignSelfCenter}
                    />
                </View>
            )}

            <View style={[styles.m5, contentStyles, bottomSafeAreaPaddingStyle]}>
                {shouldShowDismissIcon && (
                    <View style={styles.alignItemsEnd}>
                        <Tooltip text={translate('common.close')}>
                            <PressableWithoutFeedback
                                onPress={onCancel}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                                sentryLabel={CONST.SENTRY_LABEL.CONFIRM_CONTENT.DISMISS_BUTTON}
                            >
                                <Icon
                                    fill={theme.icon}
                                    src={icons.Close}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    </View>
                )}
                <View style={isCentered ? [styles.alignItemsCenter, styles.mb6] : []}>
                    {!!iconSource && (
                        <View style={[shouldCenterIcon ? styles.justifyContentCenter : null, styles.flexRow, styles.mb3]}>
                            <Icon
                                src={iconSource}
                                fill={iconFill === false ? undefined : (iconFill ?? theme.icon)}
                                width={iconWidth}
                                height={iconHeight}
                                additionalStyles={iconAdditionalStyles}
                            />
                        </View>
                    )}
                    <View style={[styles.flexRow, isTitleLoading ? styles.justifyContentBetween : {}, styles.alignItemsCenter, isCentered ? {} : styles.mb4, titleContainerStyles]}>
                        <HeaderTitle>
                            <HeaderTitle.Text style={titleStyles}>{title}</HeaderTitle.Text>
                        </HeaderTitle>
                        {isTitleLoading && <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL} />}
                    </View>
                    {subtitleContent}
                    {shouldEnablePromptScroll ? <ScrollView style={styles.confirmModalPromptScrollable}>{promptContent}</ScrollView> : promptContent}
                </View>

                {shouldStackButtons ? (
                    <>
                        {shouldShowCancelButton && shouldReverseStackedButtons && (
                            <Button
                                style={[styles.mt4, styles.noSelect]}
                                onPress={onCancel}
                                size={CONST.BUTTON_SIZE.LARGE}
                            >
                                <Button.Text>{cancelText || translate('common.no')}</Button.Text>
                            </Button>
                        )}
                        <Button
                            variant={confirmButtonVariant}
                            style={shouldReverseStackedButtons ? styles.mt3 : styles.mt4}
                            onPress={onConfirm}
                            size={CONST.BUTTON_SIZE.LARGE}
                            accessibilityLabel={confirmText || translate('common.yes')}
                            isDisabled={isOffline && shouldDisableConfirmButtonWhenOffline}
                            isLoading={isConfirmLoading}
                        >
                            <Button.KeyboardShortcut isPressOnEnterActive={isVisible} />
                            <Button.Text>{confirmText || translate('common.yes')}</Button.Text>
                        </Button>
                        {shouldShowCancelButton && !shouldReverseStackedButtons && (
                            <Button
                                style={[styles.mt3, styles.noSelect]}
                                onPress={onCancel}
                                size={CONST.BUTTON_SIZE.LARGE}
                            >
                                <Button.Text>{cancelText || translate('common.no')}</Button.Text>
                            </Button>
                        )}
                    </>
                ) : (
                    <View style={[styles.flexRow, styles.gap4]}>
                        {shouldShowCancelButton && (
                            <Button
                                style={[styles.noSelect, styles.flex1]}
                                onPress={onCancel}
                            >
                                <Button.Text>{cancelText || translate('common.no')}</Button.Text>
                            </Button>
                        )}
                        <Button
                            variant={confirmButtonVariant}
                            style={[styles.flex1]}
                            onPress={onConfirm}
                            isDisabled={isOffline && shouldDisableConfirmButtonWhenOffline}
                            isLoading={isConfirmLoading}
                        >
                            <Button.KeyboardShortcut isPressOnEnterActive={isVisible} />
                            <Button.Text>{confirmText || translate('common.yes')}</Button.Text>
                        </Button>
                    </View>
                )}
            </View>
        </>
    );
}

export default ConfirmContent;
