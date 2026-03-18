import React from 'react';
import {View} from 'react-native';
import type {ViewProps} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ExpandCollapseComposerButtonProps = ViewProps & {
    isFullComposerAvailable: boolean;
    isComposerFullSize: boolean;
    reportID: string;
    raiseIsScrollLikelyLayoutTriggered: () => void;
    setIsComposerFullSize: (reportID: string, isFullSize: boolean) => void;
    disabled?: boolean;
};

function ExpandCollapseComposerButton({
    isFullComposerAvailable,
    isComposerFullSize,
    reportID,
    disabled = false,
    raiseIsScrollLikelyLayoutTriggered,
    setIsComposerFullSize,
    ...restProps
}: ExpandCollapseComposerButtonProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Collapse', 'Expand'] as const);

    if (!isFullComposerAvailable && !isComposerFullSize) {
        return null;
    }

    const shouldCollapse = isComposerFullSize;
    const tooltipText = shouldCollapse ? translate('reportActionCompose.collapse') : translate('reportActionCompose.expand');
    const nextComposerFullSizeValue = !shouldCollapse;
    const iconSrc = shouldCollapse ? icons.Collapse : icons.Expand;
    const sentryLabel = shouldCollapse ? CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_COLLAPSE_BUTTON : CONST.SENTRY_LABEL.REPORT.ATTACHMENT_PICKER_EXPAND_BUTTON;

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...restProps}>
            <Tooltip
                text={tooltipText}
                key={shouldCollapse ? 'composer-collapse' : 'composer-expand'}
            >
                <PressableWithFeedback
                    onPress={(e) => {
                        e?.preventDefault();
                        raiseIsScrollLikelyLayoutTriggered();
                        setIsComposerFullSize(reportID, nextComposerFullSizeValue);
                    }}
                    // Keep focus on the composer when Collapse/Expand button is clicked.
                    onMouseDown={(e) => e.preventDefault()}
                    style={styles.composerSizeButton}
                    disabled={disabled}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={tooltipText}
                    sentryLabel={sentryLabel}
                >
                    <Icon
                        fill={theme.icon}
                        src={iconSrc}
                    />
                </PressableWithFeedback>
            </Tooltip>
        </View>
    );
}

export default ExpandCollapseComposerButton;
