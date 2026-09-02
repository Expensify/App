import Icon from '@components/Icon';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';

import CONST from '@src/CONST';

import type {ViewProps} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ExpandCollapseButtonProps = ViewProps & {
    /** Whether the full composer is available */
    isFullComposerAvailable: boolean;
    /** Whether the composer is full size */
    isComposerFullSize: boolean;
    /** The report ID */
    reportID: string;
    /** Function to raise the scroll is likely layout triggered */
    raiseIsScrollLikelyLayoutTriggered: () => void;
    /** Function to set the composer full size */
    setIsComposerFullSize: (reportID: string, isFullSize: boolean) => void;
    /** Whether the button is disabled */
    disabled?: boolean;
};

function ExpandCollapseButton({
    isFullComposerAvailable,
    isComposerFullSize,
    reportID,
    disabled = false,
    raiseIsScrollLikelyLayoutTriggered,
    setIsComposerFullSize,
    ...restProps
}: ExpandCollapseButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
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
        <View {...restProps}>
            <Tooltip
                text={tooltipText}
                key={shouldCollapse ? 'composer-collapse' : 'composer-expand'}
            >
                <PressableWithoutFeedback
                    onPress={(e) => {
                        e?.preventDefault();
                        raiseIsScrollLikelyLayoutTriggered();
                        setIsComposerFullSize(reportID, nextComposerFullSizeValue);
                    }}
                    // Keep focus on the composer when Collapse/Expand button is clicked.
                    onMouseDown={(e) => e.preventDefault()}
                    style={({hovered, pressed}) => [styles.composerSizeButton, StyleUtils.getButtonBackgroundColorStyle(getButtonState({isActive: hovered, isPressed: pressed}))]}
                    disabled={disabled}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={tooltipText}
                    sentryLabel={sentryLabel}
                >
                    {({hovered, pressed}) => (
                        <Icon
                            fill={StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: hovered, isPressed: pressed})})}
                            src={iconSrc}
                        />
                    )}
                </PressableWithoutFeedback>
            </Tooltip>
        </View>
    );
}

export default ExpandCollapseButton;
