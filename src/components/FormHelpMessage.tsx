import isEmpty from 'lodash/isEmpty';
import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import Parser from '@libs/Parser';
import CONST from '@src/CONST';
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
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;
    const shouldAnnounceError = isError && typeof message === 'string' && !!message && !shouldRenderMessageAsHTML && children == null;
    const shouldUseSeparateWebLiveAnnouncement = isWeb && !!nativeID && shouldAnnounceError;
    const visibleMessageRole = shouldUseSeparateWebLiveAnnouncement || !shouldAnnounceError ? undefined : CONST.ROLE.ALERT;
    const visibleMessageLiveRegion = shouldUseSeparateWebLiveAnnouncement || !shouldAnnounceError ? undefined : 'assertive';

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

    useAccessibilityAnnouncement(message, shouldAnnounceError);

    const errorIconLabel = isError && shouldShowRedDotIndicator ? CONST.ACCESSIBILITY_LABELS.ERROR : undefined;

    if (isEmpty(message) && isEmpty(children)) {
        return null;
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
            <View style={[styles.flex1, isError && shouldShowRedDotIndicator ? styles.ml2 : {}]}>
                {children ??
                    (shouldRenderMessageAsHTML ? (
                        <RenderHTML html={HTMLMessage} />
                    ) : (
                        <Text
                            style={[isError ? styles.formError : styles.formHelp, styles.mb0]}
                            nativeID={nativeID}
                            role={visibleMessageRole}
                            // TalkBack on some Android versions skips role-only alert announcements,
                            // so keep native accessibilityRole/live-region as a platform fallback.
                            accessibilityRole={!isWeb && shouldAnnounceError ? CONST.ROLE.ALERT : undefined}
                            accessibilityLiveRegion={visibleMessageLiveRegion}
                        >
                            {message}
                        </Text>
                    ))}
                {shouldUseSeparateWebLiveAnnouncement && (
                    // Keep a separate live region for immediate web announcements without
                    // changing the visible described text Safari relies on when refocusing inputs.
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
