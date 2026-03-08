import isEmpty from 'lodash/isEmpty';
import React, {useContext, useEffect, useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import CONST from '@src/CONST';
import FormContext from './Form/FormContext';
import Icon from './Icon';
import RenderHTML from './RenderHTML';
import Text from './Text';
import useFormHelpMessageAccessibilityAnnouncement from './utils/useFormHelpMessageAccessibilityAnnouncement';

type FormHelpMessageProps = {
    /** Error or hint text. Ignored when children is not empty */
    message?: string | React.ReactNode;

    /** Children to render next to dot indicator */
    children?: React.ReactNode;

    /** Indicates whether to show error or hint */
    isError?: boolean;

    /** Container style props */
    style?: StyleProp<ViewStyle>;

    /** Whether to show dot indicator */
    shouldShowRedDotIndicator?: boolean;

    /** Whether should render error text as HTML or as Text */
    shouldRenderMessageAsHTML?: boolean;

    /** Whether to show information icon */
    isInfo?: boolean;

    /** Native ID for accessibility association (aria-describedby) */
    nativeID?: string;
};

function FormHelpMessage({
    message = '',
    children,
    isError = true,
    style,
    shouldShowRedDotIndicator = true,
    shouldRenderMessageAsHTML = false,
    isInfo = false,
    nativeID,
}: FormHelpMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Exclamation']);
    const {errorAnnouncementKey} = useContext(FormContext);

    const errorAnnouncementText = useMemo(() => {
        if (!isError || typeof message !== 'string') {
            return '';
        }
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            return '';
        }
        return shouldRenderMessageAsHTML ? Parser.htmlToText(trimmedMessage) : trimmedMessage;
    }, [isError, message, shouldRenderMessageAsHTML]);

    const shouldAnnounceError = errorAnnouncementText.length > 0;

    // Two-phase DOM update: remove the alert element, then re-add after a delay.
    // Screen readers ignore same-frame unmount+remount (React key changes),
    // but detect a real gap where the element is absent from the DOM.
    const [isAnnouncementMounted, setIsAnnouncementMounted] = useState(false);
    useEffect(() => {
        if (!shouldAnnounceError) {
            setIsAnnouncementMounted(false);
            return;
        }
        setIsAnnouncementMounted(false);
        const timer = setTimeout(() => setIsAnnouncementMounted(true), 100);
        return () => clearTimeout(timer);
    }, [shouldAnnounceError, errorAnnouncementKey]);

    const HTMLMessage = useMemo(() => {
        if (typeof message !== 'string' || !shouldRenderMessageAsHTML) {
            return '';
        }

        const replacedText = Parser.replace(message, {shouldEscapeText: false});

        if (isError) {
            return `<alert-text>${replacedText}</alert-text>`;
        }

        return `<muted-text-label>${replacedText}</muted-text-label>`;
    }, [isError, message, shouldRenderMessageAsHTML]);

    useFormHelpMessageAccessibilityAnnouncement(message, shouldAnnounceError);

    const errorIconLabel = isError && shouldShowRedDotIndicator ? CONST.ACCESSIBILITY_LABELS.ERROR : undefined;

    if (isEmpty(message) && isEmpty(children)) {
        return null;
    }

    return (
        <View
            style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, style]}
            nativeID={nativeID}
        >
            {isError && shouldShowRedDotIndicator && (
                <View
                    accessible
                    role={CONST.ROLE.IMG}
                    accessibilityLabel={errorIconLabel}
                >
                    <Icon
                        src={icons.DotIndicator}
                        fill={theme.danger}
                    />
                </View>
            )}
            {isInfo && (
                <Icon
                    src={icons.Exclamation}
                    fill={theme.icon}
                    small
                    additionalStyles={[styles.mr1]}
                />
            )}
            <View style={[styles.flex1, isError && shouldShowRedDotIndicator ? styles.ml2 : {}]}>
                {isAnnouncementMounted && (
                    <Text
                        role={CONST.ROLE.ALERT}
                        accessibilityRole={CONST.ROLE.ALERT}
                        accessibilityLiveRegion="assertive"
                        style={[styles.opacity0, styles.pAbsolute, {width: 1, height: 1, overflow: 'hidden'}]}
                    >
                        {errorAnnouncementText}
                    </Text>
                )}
                {children ?? (shouldRenderMessageAsHTML ? <RenderHTML html={HTMLMessage} /> : <Text style={[isError ? styles.formError : styles.formHelp, styles.mb0]}>{message}</Text>)}
            </View>
        </View>
    );
}

export default FormHelpMessage;
