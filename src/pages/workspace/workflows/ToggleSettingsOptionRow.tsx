import type {ReactNode} from 'react';
import React, {useEffect, useMemo} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Accordion from '@components/Accordion';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useThemeStyles from '@hooks/useThemeStyles';
import Parser from '@libs/Parser';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';

type ToggleSettingOptionRowProps = {
    /** Icon to be shown for the option */
    icon?: IconAsset;

    /** Title of the option */
    title?: string;

    /** Custom title for the option */
    customTitle?: React.ReactNode;

    /** Subtitle of the option */
    subtitle?: string | ReactNode;

    /** Accessibility label for the switch */
    switchAccessibilityLabel: string;

    /** subtitle should show below switch and title */
    shouldPlaceSubtitleBelowSwitch?: boolean;

    /** Whether or not the text should be escaped */
    shouldEscapeText?: boolean;

    /** Whether should render subtitle as HTML or as Text */
    shouldParseSubtitle?: boolean;

    /** Used to apply styles to the outermost container */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Used to apply styles to the Title */
    titleStyle?: StyleProp<TextStyle>;

    /** Used to apply styles to the Subtitle */
    subtitleStyle?: StyleProp<TextStyle>;

    /** Used to apply styles to the Accordion */
    accordionStyle?: StyleProp<ViewStyle>;

    /** Whether the option is enabled or not */
    isActive: boolean;

    /** Callback to be called when the switch is toggled */
    onToggle: (isEnabled: boolean) => void;

    /** SubMenuItems will be shown when the option is enabled */
    subMenuItems?: React.ReactNode;

    /** If there is a pending action, we will grey out the option */
    pendingAction?: PendingAction;

    /** Any error message to show */
    errors?: Errors;

    /** Callback to close the error messages */
    onCloseError?: () => void;

    /** Whether the toggle should be disabled */
    disabled?: boolean;

    /** Whether to show the lock icon even if the switch is enabled */
    showLockIcon?: boolean;

    /** Callback to fire when the switch is toggled in disabled state */
    disabledAction?: () => void;

    /** Callback to fire when the content area is pressed (only works when isActive is true) */
    onPress?: () => void;
};
const ICON_SIZE = 48;

function ToggleSettingOptionRow({
    icon,
    title,
    customTitle,
    subtitle,
    subtitleStyle,
    accordionStyle,
    switchAccessibilityLabel,
    shouldPlaceSubtitleBelowSwitch,
    shouldEscapeText = undefined,
    shouldParseSubtitle = false,
    wrapperStyle,
    titleStyle,
    onToggle,
    subMenuItems,
    isActive,
    disabledAction,
    pendingAction,
    errors,
    onCloseError,
    disabled = false,
    showLockIcon = false,
    onPress,
}: ToggleSettingOptionRowProps) {
    const styles = useThemeStyles();
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isActive);

    useEffect(() => {
        isAccordionExpanded.set(isActive);
    }, [isAccordionExpanded, isActive]);

    const subtitleHtml = useMemo(() => {
        if (!subtitle || !shouldParseSubtitle || typeof subtitle !== 'string') {
            return '';
        }
        return Parser.replace(subtitle, {shouldEscapeText});
    }, [subtitle, shouldParseSubtitle, shouldEscapeText]);

    const processedSubtitle = useMemo(() => {
        let textToWrap = '';

        if (shouldParseSubtitle) {
            textToWrap = subtitleHtml;
        }

        return textToWrap ? `<comment><muted-text-label>${textToWrap}</muted-text-label></comment>` : '';
    }, [shouldParseSubtitle, subtitleHtml]);

    const subTitleView = useMemo(() => {
        if (typeof subtitle === 'string') {
            if (!!subtitle && shouldParseSubtitle) {
                return (
                    <View style={[styles.flexRow, styles.renderHTML, shouldPlaceSubtitleBelowSwitch ? styles.mt1 : {...styles.mt1, ...styles.mr5}]}>
                        <RenderHTML html={processedSubtitle} />
                    </View>
                );
            }
            return <Text style={[styles.mutedNormalTextLabel, shouldPlaceSubtitleBelowSwitch ? styles.mt1 : {...styles.mt1, ...styles.mr5}, subtitleStyle]}>{subtitle}</Text>;
        }

        return subtitle;
    }, [
        subtitle,
        shouldParseSubtitle,
        styles.mutedNormalTextLabel,
        styles.mt1,
        styles.mr5,
        styles.flexRow,
        styles.renderHTML,
        shouldPlaceSubtitleBelowSwitch,
        subtitleStyle,
        processedSubtitle,
    ]);

    const contentArea = (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
            {!!icon && (
                <Icon
                    src={icon}
                    height={ICON_SIZE}
                    width={ICON_SIZE}
                    additionalStyles={[styles.mr3]}
                />
            )}
            {customTitle ?? (
                <View style={[styles.flexColumn, styles.flex1]}>
                    <Text style={[styles.textNormal, styles.lh20, titleStyle]}>{title}</Text>
                    {!shouldPlaceSubtitleBelowSwitch && subtitle && subTitleView}
                </View>
            )}
        </View>
    );

    const shouldMakeContentPressable = isActive && onPress;
    const isSwitchAccessibilityLabelAndSubtitleAreEqual = switchAccessibilityLabel === subtitle;

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={[styles.mt2]}
            style={[wrapperStyle]}
            onClose={onCloseError}
        >
            <View style={styles.pRelative}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, shouldPlaceSubtitleBelowSwitch && styles.h10]}>
                    <PressableWithoutFeedback
                        style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                        onPress={shouldMakeContentPressable ? onPress : undefined}
                        accessibilityLabel={title}
                        role="button"
                        accessible={false}
                        disabled={!shouldMakeContentPressable}
                    >
                        {contentArea}
                    </PressableWithoutFeedback>
                    <Switch
                        disabledAction={disabledAction}
                        accessibilityLabel={
                            typeof subtitle === 'string' && subtitle && isSwitchAccessibilityLabelAndSubtitleAreEqual ? `${switchAccessibilityLabel}, ${subtitle}` : switchAccessibilityLabel
                        }
                        onToggle={(isOn) => {
                            shouldAnimateAccordionSection.set(true);
                            onToggle(isOn);
                        }}
                        isOn={isActive}
                        disabled={disabled}
                        showLockIcon={showLockIcon}
                    />
                </View>
                {shouldPlaceSubtitleBelowSwitch && subtitle && subTitleView}
                <Accordion
                    isExpanded={isAccordionExpanded}
                    style={accordionStyle}
                    isToggleTriggered={shouldAnimateAccordionSection}
                >
                    {subMenuItems}
                </Accordion>
            </View>
        </OfflineWithFeedback>
    );
}

export type {ToggleSettingOptionRowProps};
export default ToggleSettingOptionRow;
