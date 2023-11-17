import React, {memo} from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import getButtonState from '@libs/getButtonState';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import Hoverable from './Hoverable';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {LocaleContextProps} from './LocaleContextProvider';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import RenderHTML from './RenderHTML';
import Text from './Text';
import Tooltip from './Tooltip';
import withLocalize from './withLocalize';

type BannerProps = LocaleContextProps & {
    /** Text to display in the banner. */
    text: string;

    /** Should this component render the left-aligned exclamation icon? */
    shouldShowIcon?: boolean;

    /** Should this component render a close button? */
    shouldShowCloseButton?: boolean;

    /** Should this component render the text as HTML? */
    shouldRenderHTML?: boolean;

    /** Callback called when the close button is pressed */
    onClose?: () => void;

    /** Callback called when the message is pressed */
    onPress?: () => void;

    /** Styles to be assigned to the Banner container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Styles to be assigned to the Banner text */
    textStyles?: StyleProp<TextStyle>;
};

function Banner({text, translate, onClose, onPress, containerStyles, textStyles, shouldRenderHTML = false, shouldShowIcon = false, shouldShowCloseButton = false}: BannerProps) {
    const styles = useThemeStyles();

    return (
        <Hoverable>
            {(isHovered) => {
                const isClickable = onClose ?? onPress;
                const shouldHighlight = isClickable && isHovered;
                return (
                    <View
                        style={[
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.p5,
                            styles.borderRadiusNormal,
                            shouldHighlight ? styles.activeComponentBG : styles.hoveredComponentBG,
                            styles.breakAll,
                            containerStyles,
                        ]}
                    >
                        <View style={[styles.flexRow, styles.flexGrow1, styles.mw100, styles.alignItemsCenter]}>
                            {shouldShowIcon && (
                                <View style={[styles.mr3]}>
                                    <Icon
                                        src={Expensicons.Exclamation}
                                        fill={StyleUtils.getIconFillColor(getButtonState(shouldHighlight))}
                                    />
                                </View>
                            )}
                            {shouldRenderHTML ? (
                                <RenderHTML html={text} />
                            ) : (
                                <Text
                                    style={textStyles}
                                    onPress={onPress}
                                    suppressHighlighting
                                >
                                    {text}
                                </Text>
                            )}
                        </View>
                        {shouldShowCloseButton && !!onClose && (
                            <Tooltip text={translate('common.close')}>
                                <PressableWithFeedback
                                    onPress={onClose}
                                    role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                    accessibilityLabel={translate('common.close')}
                                >
                                    <Icon src={Expensicons.Close} />
                                </PressableWithFeedback>
                            </Tooltip>
                        )}
                    </View>
                );
            }}
        </Hoverable>
    );
}

Banner.displayName = 'Banner';

// TODO: use `compose` function for HOCs composing once TypeScript issues are resolved.
export default memo(withLocalize(Banner));
