import React, {ReactNode} from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import Button from './Button';
import Header from './Header';
import Icon from './Icon';
import Text from './Text';

type ConfirmContentProps = {
    /** Title of the modal */
    title: string,

    /** A callback to call when the form has been submitted */
    onConfirm: (...args: unknown[]) => unknown,

    /** A callback to call when the form has been closed */
    onCancel: (...args: unknown[]) => unknown,

    /** Confirm button text */
    confirmText: string,

    /** Cancel button text */
    cancelText: string,

    /** Modal content text/element */
    prompt: string | Element,

    /** Whether we should use the success button color */
    success: boolean,

    /** Whether we should use the danger button color. Use if the action is destructive */
    danger: boolean,

    /** Whether we should disable the confirm button when offline */
    shouldDisableConfirmButtonWhenOffline: boolean,

    /** Whether we should show the cancel button */
    shouldShowCancelButton: boolean,

    /** Icon to display above the title */
    iconSource: string | ((props: unknown) => ReactNode),

    /** Whether to center the icon / text content */
    shouldCenterContent: boolean,

    /** Whether to stack the buttons */
    shouldStackButtons: boolean,

    /** Styles for title */
    titleStyles: Array<StyleProp<TextStyle>>,

    /** Styles for prompt */
    promptStyles: Array<StyleProp<ViewStyle>>,

    /** Styles for view */
    contentStyles: Array<StyleProp<ViewStyle>>,

    /** Styles for icon */
    iconAdditionalStyles: Array<StyleProp<ViewStyle>>,
};

function ConfirmContent(props: ConfirmContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const isCentered = props.shouldCenterContent;

    return (
        <View style={[styles.m5, ...props.contentStyles]}>
            <View style={isCentered ? [styles.alignItemsCenter, styles.mb6] : []}>
                {(Object.keys(props.iconSource).length !== 0) ||
                    (typeof props.iconSource === "function") && (
                        <View style={[styles.flexRow, styles.mb3]}>
                            <Icon
                                src={props.iconSource}
                                width={variables.appModalAppIconSize}
                                height={variables.appModalAppIconSize}
                                additionalStyles={[...props.iconAdditionalStyles]}
                            />
                        </View>
                    )}

                <View style={[styles.flexRow, isCentered ? {} : styles.mb4]}>
                    <Header
                        title={props.title}
                        textStyles={[...props.titleStyles]}
                    />
                </View>
                {typeof props.prompt === "string" ? <Text style={[...props.promptStyles, isCentered ? styles.textAlignCenter : {}]}>{props.prompt}</Text> : props.prompt}
            </View>

            {props.shouldStackButtons ? (
                <>
                    <Button
                        success={props.success}
                        danger={props.danger}
                        style={[styles.mt4]}
                        onPress={props.onConfirm}
                        pressOnEnter
                        text={props.confirmText || translate('common.yes')}
                        isDisabled={isOffline && props.shouldDisableConfirmButtonWhenOffline}
                    />
                    {props.shouldShowCancelButton && (
                        <Button
                            style={[styles.mt3, styles.noSelect]}
                            onPress={props.onCancel}
                            text={props.cancelText || translate('common.no')}
                        />
                    )}
                </>
            ) : (
                <View style={[styles.flexRow, styles.gap4]}>
                    {props.shouldShowCancelButton && (
                        <Button
                            style={[styles.noSelect, styles.flex1]}
                            onPress={props.onCancel}
                            text={props.cancelText || translate('common.no')}
                            medium
                        />
                    )}
                    <Button
                        success={props.success}
                        danger={props.danger}
                        style={[styles.flex1]}
                        onPress={props.onConfirm}
                        pressOnEnter
                        text={props.confirmText || translate('common.yes')}
                        isDisabled={isOffline && props.shouldDisableConfirmButtonWhenOffline}
                        medium
                    />
                </View>
            )}
        </View>
    );
}

ConfirmContent.displayName = 'ConfirmContent';
export default ConfirmContent;
