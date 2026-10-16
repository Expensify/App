import {render} from '@testing-library/react-native';

import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import ComposeProviders from '@components/ComposeProviders';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import createThemeStyles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import createStyleUtils from '@src/styles/utils';

import React from 'react';
import {Rect} from 'react-native-svg';

const styles = createThemeStyles(defaultTheme);
const {getAvatarSize} = createStyleUtils(defaultTheme, styles);

function ThemeProviderWithLight({children}: {children: React.ReactNode}) {
    return <ThemeProvider theme="light">{children}</ThemeProvider>;
}

function getHeight(style: unknown): number | undefined {
    if (typeof style !== 'object' || style === null || !('height' in style)) {
        return undefined;
    }

    const {height} = style;
    return typeof height === 'number' ? height : undefined;
}

/**
 * Renders the stacked skeleton without a `width`, which is the branch that reserves the final height in a plain
 * `View` while it waits to be measured. Returns that reserved height.
 */
function getReservedStackedHeight(shouldShowSwitchButton: boolean): number {
    const {toJSON} = render(
        <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider]}>
            <AccountSwitcherSkeletonView
                shouldAnimate={false}
                avatarSize={CONST.AVATAR_SIZE.XXXX_LARGE}
                shouldStackHeader
                shouldShowSwitchButton={shouldShowSwitchButton}
            />
        </ComposeProviders>,
    );

    const tree = toJSON();
    const placeholder = !tree || Array.isArray(tree) ? undefined : tree.children?.at(0);
    const height = typeof placeholder === 'object' ? getHeight(placeholder.props.style) : undefined;

    if (height === undefined) {
        throw new Error('Expected the skeleton to render a height-reserving View');
    }

    return height;
}

/**
 * Renders the stacked skeleton at a fixed `width`, which skips measurement and draws the real shapes.
 * Returns the props of the rect standing in for the "Switch accounts" button.
 */
function getSwitchButtonRectProps(): Record<string, unknown> {
    const view = render(
        <ComposeProviders components={[ThemeProviderWithLight, ThemeStylesProvider]}>
            <AccountSwitcherSkeletonView
                shouldAnimate={false}
                avatarSize={CONST.AVATAR_SIZE.XXXX_LARGE}
                width={320}
                shouldStackHeader
                shouldShowSwitchButton
            />
        </ComposeProviders>,
    );

    const buttonRect = view.UNSAFE_getAllByType(Rect).find((rect) => rect.props.height === variables.componentSizeSmall);

    if (!buttonRect) {
        throw new Error('Expected the skeleton to render a rect at the button height');
    }

    return buttonRect.props as Record<string, unknown>;
}

describe('AccountSwitcherSkeletonView', () => {
    it('reserves the avatar, name and login lines for the stacked layout', () => {
        const expectedHeight = getAvatarSize(CONST.AVATAR_SIZE.XXXX_LARGE) + styles.gap3.gap + variables.lineHeightSizeH1 + styles.gap1.gap + variables.lineHeightNormal;

        expect(getReservedStackedHeight(false)).toBe(expectedHeight);
    });

    it('also reserves the "Switch accounts" button row when the header will render one', () => {
        const heightWithoutButton = getReservedStackedHeight(false);
        const heightWithButton = getReservedStackedHeight(true);

        expect(heightWithButton - heightWithoutButton).toBe(styles.gap4.gap + variables.componentSizeSmall);
    });

    it('draws the "Switch accounts" button as a pill rather than an ellipse', () => {
        const {rx, ry} = getSwitchButtonRectProps();

        // SVG clamps rx and ry independently, so anything above half the height rounds the rect into an
        // ellipse instead of the pill the button renders as.
        expect(rx).toBe(variables.componentSizeSmall / 2);
        expect(ry).toBe(variables.componentSizeSmall / 2);
    });
});
