import type {ReactNode} from 'react';
import React, {useCallback, useContext} from 'react';
import type {LayoutChangeEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import {Actions, ActionSheetAwareScrollViewContext} from './ActionSheetAwareScrollView';
import Button from './Button';
import Header from './Header';
import Icon from './Icon';
import ImageSVG from './ImageSVG';
import Text from './Text';

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

    /** Whether we should use the success button color */
    success?: boolean;

    /** Whether we should use the danger button color. Use if the action is destructive */
    danger?: boolean;

    /** Whether we should disable the confirm button when offline */
    shouldDisableConfirmButtonWhenOffline?: boolean;

    /** Whether we should show the cancel button */
    shouldShowCancelButton?: boolean;

    /** Icon to display above the title */
    iconSource?: IconAsset;

    /** Whether to center the icon / text content */
    shouldCenterContent?: boolean;

    /** Whether to stack the buttons */
    shouldStackButtons?: boolean;

    /** Styles for title */
    titleStyles?: StyleProp<TextStyle>;

    /** Styles for prompt */
    promptStyles?: StyleProp<TextStyle>;

    /** Styles for view */
    contentStyles?: StyleProp<ViewStyle>;

    /** Styles for icon */
    iconAdditionalStyles?: StyleProp<ViewStyle>;

    /** Image to display with content */
    image?: IconAsset;
};

function ConfirmContent({
    title,
    onConfirm,
    onCancel = () => {},
    confirmText = '',
    cancelText = '',
    prompt = '',
    success = true,
    danger = false,
    shouldDisableConfirmButtonWhenOffline = false,
    shouldShowCancelButton = false,
    iconSource,
    shouldCenterContent = false,
    shouldStackButtons = true,
    titleStyles,
    promptStyles,
    contentStyles,
    iconAdditionalStyles,
    image,
}: ConfirmContentProps) {
    const actionSheetAwareScrollViewContext = useContext(ActionSheetAwareScrollViewContext);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const StyleUtils = useStyleUtils();

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const {height} = event.nativeEvent.layout;

            actionSheetAwareScrollViewContext.transitionActionSheetState({
                type: Actions.MEASURE_CONFIRM_MODAL,
                payload: {
                    popoverHeight: height,
                },
            });
        },
        [actionSheetAwareScrollViewContext],
    );

    const isCentered = shouldCenterContent;

    return (
        <>
            {!!image && (
                <View style={[StyleUtils.getBackgroundColorStyle(colors.pink800)]}>
                    <ImageSVG
                        contentFit="contain"
                        src={image}
                        height={CONST.CONFIRM_CONTENT_SVG_SIZE.HEIGHT}
                        width={CONST.CONFIRM_CONTENT_SVG_SIZE.WIDTH}
                        style={styles.alignSelfCenter}
                    />
                </View>
            )}

            <View
                onLayout={onLayout}
                style={[styles.m5, contentStyles]}
            >
                <View style={isCentered ? [styles.alignItemsCenter, styles.mb6] : []}>
                    {typeof iconSource === 'function' && (
                        <View style={[styles.flexRow, styles.mb3]}>
                            <Icon
                                src={iconSource}
                                fill={theme.icon}
                                width={variables.appModalAppIconSize}
                                height={variables.appModalAppIconSize}
                                additionalStyles={iconAdditionalStyles}
                            />
                        </View>
                    )}
                    <View style={[styles.flexRow, isCentered ? {} : styles.mb4]}>
                        <Header
                            title={title}
                            textStyles={titleStyles}
                        />
                    </View>
                    {typeof prompt === 'string' ? <Text style={[promptStyles, isCentered ? styles.textAlignCenter : {}]}>{prompt}</Text> : prompt}
                </View>

                {shouldStackButtons ? (
                    <>
                        <Button
                            success={success}
                            danger={danger}
                            style={[styles.mt4]}
                            onPress={onConfirm}
                            pressOnEnter
                            large
                            text={confirmText || translate('common.yes')}
                            isDisabled={isOffline && shouldDisableConfirmButtonWhenOffline}
                        />
                        {shouldShowCancelButton && (
                            <Button
                                style={[styles.mt3, styles.noSelect]}
                                onPress={onCancel}
                                large
                                text={cancelText || translate('common.no')}
                            />
                        )}
                    </>
                ) : (
                    <View style={[styles.flexRow, styles.gap4]}>
                        {shouldShowCancelButton && (
                            <Button
                                style={[styles.noSelect, styles.flex1]}
                                onPress={onCancel}
                                text={cancelText || translate('common.no')}
                                medium
                            />
                        )}
                        <Button
                            success={success}
                            danger={danger}
                            style={[styles.flex1]}
                            onPress={onConfirm}
                            pressOnEnter
                            text={confirmText || translate('common.yes')}
                            isDisabled={isOffline && shouldDisableConfirmButtonWhenOffline}
                            medium
                        />
                    </View>
                )}
            </View>
        </>
    );
}

ConfirmContent.displayName = 'ConfirmContent';

export default ConfirmContent;
