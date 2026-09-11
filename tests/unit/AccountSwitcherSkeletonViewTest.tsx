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
                shouldStack
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
});
