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
        // Given native popovers need a dimmed, dismissible background even on tablet-sized windows
        jest.replaceProperty(Platform, 'OS', platform);

        // When the anchored popover chooses its wide-window styles
        const {hideBackdrop} = getModalStyles({
            type: CONST.MODAL.MODAL_TYPE.POPOVER,
            windowDimensions: {windowWidth: 1200, windowHeight: 900, isSmallScreenWidth: false},
        });

        // Then web's undimmed-popover rule must not hide the native backdrop
        expect(hideBackdrop).toBe(false);
    });

    it('keeps anchored web popovers undimmed', () => {
        // Given anchored web menus retain their existing undimmed presentation
        jest.replaceProperty(Platform, 'OS', 'web');

        // When the same wide-window popover styles are calculated for web
        const {hideBackdrop} = getModalStyles({
            type: CONST.MODAL.MODAL_TYPE.POPOVER,
            windowDimensions: {windowWidth: 1200, windowHeight: 900, isSmallScreenWidth: false},
        });

        // Then native backdrop support must not add dimming to existing web menus
        expect(hideBackdrop).toBe(true);
    });

    it.each([0, 0.35, variables.overlayOpacity])('matches both fade endpoints to the resting opacity of %s', (opacity) => {
        // Given callers can choose a lighter backdrop or a completely transparent one
        // When entering and exiting fades are built for that resting opacity
        const entering = getModalInAnimation('fadeIn', opacity);
        const exiting = getModalOutAnimation('fadeOut', opacity);

        // Then both fades must meet the resting opacity without a flash at mount or dismissal
        expect(entering.from).toEqual({opacity: 0});
        expect(entering.to).toEqual(expect.objectContaining({opacity}));
        expect(exiting.from).toEqual({opacity});
        expect(exiting.to).toEqual(expect.objectContaining({opacity: 0}));
    });

    it('preserves the default fade opacity for callers without an override', () => {
        // Given existing modal callers rely on the shared backdrop opacity without passing an override
        // When those callers request their entering and exiting fades
        // Then support for custom opacity must not change the existing resting endpoints
        expect(getModalInAnimation('fadeIn').to).toEqual(expect.objectContaining({opacity: variables.overlayOpacity}));
        expect(getModalOutAnimation('fadeOut').from).toEqual({opacity: variables.overlayOpacity});
    });
});
