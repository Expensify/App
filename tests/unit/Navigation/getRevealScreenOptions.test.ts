import getRevealScreenOptions from '@libs/Navigation/AppNavigator/getRevealScreenOptions';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const BASE_OPTIONS = {animation: Animations.SLIDE_FROM_RIGHT, gestureEnabled: true} as PlatformStackNavigationOptions;

describe('getRevealScreenOptions', () => {
    it('returns the base options untouched when noEnterAnimation is not set', () => {
        expect(getRevealScreenOptions(undefined, BASE_OPTIONS)).toBe(BASE_OPTIONS);
        expect(getRevealScreenOptions({}, BASE_OPTIONS)).toBe(BASE_OPTIONS);
        expect(getRevealScreenOptions({noEnterAnimation: false}, BASE_OPTIONS)).toBe(BASE_OPTIONS);
    });

    it('disables only the enter animation while preserving gestureEnabled (guards iOS swipe-back #93003)', () => {
        const result = getRevealScreenOptions({noEnterAnimation: true}, BASE_OPTIONS);
        expect(result.animation).toBe(Animations.NONE);
        // gestureEnabled must survive so iOS swipe-back to WORKSPACES_LIST keeps working (#93003).
        expect(result.gestureEnabled).toBe(true);
        // The base options are not mutated.
        expect(BASE_OPTIONS.animation).toBe(Animations.SLIDE_FROM_RIGHT);
    });
});
