import React from 'react';
import Button from '@components/ButtonComposed/Button';
import ButtonIcon from '@components/ButtonComposed/primitives/ButtonIcon';
import ButtonKeyboardShortcut from '@components/ButtonComposed/primitives/ButtonKeyboardShortcut';
import type {ButtonTextProps} from '@components/ButtonComposed/primitives/ButtonText';
import ButtonText from '@components/ButtonComposed/primitives/ButtonText';
import type {ButtonProps} from '@components/ButtonComposed/types';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

/**
 * Link-styled text primitive used inside `LinkButton`. Wraps `ButtonText` and
 * applies the link-specific typography (normal font weight, label font size)
 * plus the link color, swapping to `theme.linkHover` while the button is
 * hovered. Reads `isHovered` from the parent `Button`'s context so the hover
 * state is in sync with the surrounding pressable.
 */
function LinkButtonText({children, numberOfLines, style, hoverStyle}: ButtonTextProps) {
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
 * LinkButton – composable link-style button.
 *
 * Drop-in replacement for `<Button link>` from the legacy `@components/Button`.
 * Built on top of the new `ButtonComposed` `Button`, but `Button` no longer
 * exposes a `'link'` variant — all link-specific behavior lives here:
 *   - Transparent background applied as an invariant (callers cannot override
 *     it via `innerStyles`).
 *   - Default hover background neutralized via `hoverStyles={styles.bgTransparent}`,
 *     since the legacy `link` Button was always rendered with the default hover
 *     disabled everywhere it was used in the codebase. The two are coupled in
 *     practice, so we bake that coupling into `LinkButton`.
 *   - `LinkButton.Text` (a `LinkButtonText` instance) applies link-colored
 *     typography.
 *
 * The name is `LinkButton` (not `Link`) because `Link` collides with the
 * `jsx-a11y/anchor-is-valid` rule that treats `<Link>` as an HTML anchor and
 * demands an `href`. Our component is a button, never an anchor, so we use a
 * name that doesn't trigger that false positive.
 *
 * Like `Button`, content is composed via children using the same primitives:
 *   - `LinkButton.Icon`
 *   - `LinkButton.Text`
 *   - `LinkButton.DoubleLineText`
 *   - `LinkButton.KeyboardShortcut`
 *
 * @example
 * ```tsx
 * <LinkButton onPress={handlePress}>
 *   <LinkButton.Icon src={icons.ExternalLink} />
 *   <LinkButton.Text>Open docs</LinkButton.Text>
 * </LinkButton>
 * ```
 */
type LinkButtonProps = Omit<ButtonProps, 'variant'>;

function LinkButtonComponent({innerStyles = [], children, ...rest}: LinkButtonProps) {
    const styles = useThemeStyles();
    return (
        <Button
            {...rest}
            innerStyles={[innerStyles, styles.bgTransparent]}
            hoverStyles={styles.bgTransparent}
        >
            {children}
        </Button>
    );
}

const LinkButton = Object.assign(LinkButtonComponent, {
    Icon: ButtonIcon,
    Text: LinkButtonText,
    KeyboardShortcut: ButtonKeyboardShortcut,
});

export default LinkButton;
export type {LinkButtonProps};
