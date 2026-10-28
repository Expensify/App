import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

function getFocusedScreenName(path: string): string | undefined {
    return findFocusedRoute(getAdaptedStateFromPath(path, undefined))?.name;
}

describe('Talk to a human link', () => {
    it('lands on the Help page', () => {
        // Given the link that Concierge replies point to
        // When it is opened
        // Then the focused screen is Account > Help, not Not Found
        expect(getFocusedScreenName(`/${ROUTES.TALK_TO_HUMAN}`)).toBe(SCREENS.SETTINGS.HELP);
    });

    it('serializes back to the canonical Help path', () => {
        // Given the link opened as a URL
        const state = getAdaptedStateFromPath(`/${ROUTES.TALK_TO_HUMAN}`, undefined);

        // When the state is written back to a path
        // Then it is the Help path, so refreshing or sharing the URL keeps working
        expect(getPathFromState(state)).toBe(`/${ROUTES.SETTINGS_HELP}`);
    });

    it('keeps the Help page reachable under its own path', () => {
        expect(getFocusedScreenName(`/${ROUTES.SETTINGS_HELP}`)).toBe(SCREENS.SETTINGS.HELP);
    });
});
