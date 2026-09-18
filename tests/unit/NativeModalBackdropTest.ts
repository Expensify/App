import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';

import CONST from '@src/CONST';
import createThemeStyles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import createStyleUtils from '@src/styles/utils';
import variables from '@src/styles/variables';

import {Platform} from 'react-native';

const {getModalStyles} = createStyleUtils(defaultTheme, createThemeStyles(defaultTheme));

describe('Native modal backdrops', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each(['android', 'ios'] as const)('keeps the backdrop visible for anchored popovers on %s', (platform) => {
        jest.replaceProperty(Platform, 'OS', platform);

        const {hideBackdrop} = getModalStyles({
            type: CONST.MODAL.MODAL_TYPE.POPOVER,
            windowDimensions: {windowWidth: 1200, windowHeight: 900, isSmallScreenWidth: false},
        });

        expect(hideBackdrop).toBe(false);
    });

    it('keeps anchored web popovers undimmed', () => {
        jest.replaceProperty(Platform, 'OS', 'web');

        const {hideBackdrop} = getModalStyles({
            type: CONST.MODAL.MODAL_TYPE.POPOVER,
            windowDimensions: {windowWidth: 1200, windowHeight: 900, isSmallScreenWidth: false},
        });

        expect(hideBackdrop).toBe(true);
    });

    it.each([0, 0.35, variables.overlayOpacity])('matches both fade endpoints to the resting opacity of %s', (opacity) => {
        const entering = getModalInAnimation('fadeIn', opacity);
        const exiting = getModalOutAnimation('fadeOut', opacity);

        expect(entering.from).toEqual({opacity: 0});
        expect(entering.to).toEqual(expect.objectContaining({opacity}));
        expect(exiting.from).toEqual({opacity});
        expect(exiting.to).toEqual(expect.objectContaining({opacity: 0}));
    });

    it('preserves the default fade opacity for callers without an override', () => {
        expect(getModalInAnimation('fadeIn').to).toEqual(expect.objectContaining({opacity: variables.overlayOpacity}));
        expect(getModalOutAnimation('fadeOut').from).toEqual({opacity: variables.overlayOpacity});
    });
});
