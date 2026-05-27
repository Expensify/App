import React from 'react';
import Button from '@components/ButtonComposed/Button';
import ButtonDoubleLineText from '@components/ButtonComposed/primitives/ButtonDoubleLineText';
import ButtonIcon from '@components/ButtonComposed/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@components/ButtonComposed/primitives/ButtonKeyboardShortcut';
import type {ButtonTextProps} from '@components/ButtonComposed/primitives/ButtonText';
import ButtonText from '@components/ButtonComposed/primitives/ButtonText';
import type {ButtonProps} from '@components/ButtonComposed/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

/**
 * Link-styled text primitive used inside `Link`. Wraps `ButtonText` and
 * applies the link-specific typography (normal font weight, label font size)
 * plus the link color, swapping to `theme.linkHover` while the button is
 * hovered. Reads `isHovered` from the parent `Button`'s context so the hover
 * state is in sync with the surrounding pressable.
 */
function LinkText({children, numberOfLines, style, hoverStyle}: ButtonTextProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <ButtonText
            numberOfLines={numberOfLines}
            style={[styles.fontWeightNormal, styles.fontSizeLabel, style, styles.link]}
            hoverStyle={[StyleUtils.getColorStyle(theme.linkHover), hoverStyle]}
        >
            {children}
        </ButtonText>
    );
}

/**
 * Link – composable link-style button.
 *
 * Drop-in replacement for `<Button link>` from the legacy `@components/Button`.
 * Built on top of the new `ButtonComposed` `Button`, but `Button` no longer
 * exposes a `'link'` variant — all link-specific behavior lives here:
 *   - Transparent background applied as an invariant (callers cannot override
 *     it via `innerStyles`).
 *   - `shouldUseDefaultHover` is forced off because the legacy `link` Button
 *     was always rendered with `shouldUseDefaultHover={false}` everywhere it
 *     was used in the codebase. The two props are coupled in practice, so we
 *     bake that coupling into `Link` and remove both from the public API.
 *   - `Link.Text` (a `LinkText` instance) applies link-colored typography.
 *
 * Like `Button`, content is composed via children using the same primitives:
 *   - `Link.Icon`
 *   - `Link.Text`
 *   - `Link.DoubleLineText`
 *   - `Link.KeyboardShortcut`
 *
 * @example
 * ```tsx
 * <Link onPress={handlePress}>
 *   <Link.Icon src={icons.ExternalLink} />
 *   <Link.Text>Open docs</Link.Text>
 * </Link>
 * ```
 */
type LinkProps = Omit<ButtonProps, 'variant' | 'shouldUseDefaultHover'>;

function LinkComponent({innerStyles = [], children, ...rest}: LinkProps) {
    const styles = useThemeStyles();
    return (
        <Button
            {...rest}
            innerStyles={[innerStyles, styles.bgTransparent]}
            shouldUseDefaultHover={false}
        >
            {children}
        </Button>
    );
}

const Link = Object.assign(LinkComponent, {
    Icon: ButtonIcon,
    Text: LinkText,
    DoubleLineText: ButtonDoubleLineText,
    KeyboardShortcut: ButtonKeyboardShortcut,
});

export default Link;
export type {LinkProps};
