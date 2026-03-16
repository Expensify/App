import isEmpty from 'lodash/isEmpty';
import React, {useContext, useMemo} from 'react';
import type {Role, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useDebouncedValue from '@hooks/useDebouncedValue';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Parser from '@libs/Parser';
import CONST from '@src/CONST';
import FormContext from './Form/FormContext';
import Icon from './Icon';
import RenderHTML from './RenderHTML';
import Text from './Text';

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

    /** Whether this message should be re-announced on repeated form submissions.
     *  All error messages announce on first appearance. This prop controls whether
     *  the message also re-announces when the form is re-submitted with the same errors. */
    shouldReannounceOnSubmit?: boolean;
};

const ANNOUNCEMENT_DEBOUNCE_DELAY = 100;

function FormHelpMessage({
    message = '',
    children,
    isError = true,
    style,
    shouldShowRedDotIndicator = true,
    shouldRenderMessageAsHTML = false,
    isInfo = false,
    nativeID,
    shouldReannounceOnSubmit = false,
}: FormHelpMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Exclamation']);
    const {errorAnnouncementKey} = useContext(FormContext);

    // Upstream initial-announcement logic for field-level errors (no children, plain text)
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;
    const shouldAnnounceError = isError && typeof message === 'string' && !!message && !shouldRenderMessageAsHTML && children == null;
    const shouldUseSeparateWebLiveAnnouncement = isWeb && !!nativeID && shouldAnnounceError;
    const visibleMessageRole = shouldUseSeparateWebLiveAnnouncement || !shouldAnnounceError ? undefined : CONST.ROLE.ALERT;
    const visibleMessageLiveRegion = shouldUseSeparateWebLiveAnnouncement || !shouldAnnounceError ? undefined : 'assertive';

    // Re-announcement logic for form summary messages (shouldReannounceOnSubmit)
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

    const hasError = errorAnnouncementText.length > 0;

    // Debounce the announcement key so the alert role briefly drops when
    // errorAnnouncementKey changes (key goes to undefined), then re-appears
    // after the delay. This gap lets screen readers detect a fresh alert.
    const debouncedAnnouncementKey = useDebouncedValue(errorAnnouncementKey, ANNOUNCEMENT_DEBOUNCE_DELAY);
    const isReAnnouncementReady = shouldReannounceOnSubmit && hasError && errorAnnouncementKey === debouncedAnnouncementKey;

    // Field-level initial announcement (web via Text role, iOS via AccessibilityInfo)
    useAccessibilityAnnouncement(message, shouldAnnounceError);

    // Form summary re-announcement on native via announcementKey
    useAccessibilityAnnouncement(errorAnnouncementText, hasError && shouldReannounceOnSubmit, {
        shouldAnnounceOnNative: true,
        announcementKey: errorAnnouncementKey,
    });

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

    const errorIconLabel = isError && shouldShowRedDotIndicator ? CONST.ACCESSIBILITY_LABELS.ERROR : undefined;

    if (isEmpty(message) && isEmpty(children)) {
        return null;
    }

    // Web re-announcement for form summary: debounced key creates a gap (role drops
    // then re-appears) so screen readers detect a fresh alert on form re-submission.
    // Only applies to shouldReannounceOnSubmit instances (the summary message with children).
    let viewKey: string | undefined;
    let viewRole: Role | undefined;

    if (shouldReannounceOnSubmit) {
        viewKey = isReAnnouncementReady ? `error-${errorAnnouncementKey}` : undefined;
        viewRole = isReAnnouncementReady ? CONST.ROLE.ALERT : undefined;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, style]}>
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
            <View
                key={viewKey}
                role={viewRole}
                style={[styles.flex1, isError && shouldShowRedDotIndicator ? styles.ml2 : {}]}
            >
                {children ??
                    (shouldRenderMessageAsHTML ? (
                        <RenderHTML html={HTMLMessage} />
                    ) : (
                        <Text
                            style={[isError ? styles.formError : styles.formHelp, styles.mb0]}
                            nativeID={nativeID}
                            role={visibleMessageRole}
                            accessibilityRole={!isWeb && shouldAnnounceError ? CONST.ROLE.ALERT : undefined}
                            accessibilityLiveRegion={visibleMessageLiveRegion}
                        >
                            {message}
                        </Text>
                    ))}
                {shouldUseSeparateWebLiveAnnouncement && (
                    <Text
                        style={styles.hiddenElementOutsideOfWindow}
                        role={CONST.ROLE.ALERT}
                        accessibilityLiveRegion="assertive"
                    >
                        {message}
                    </Text>
                )}
            </View>
        </View>
    );
}

export default FormHelpMessage;
