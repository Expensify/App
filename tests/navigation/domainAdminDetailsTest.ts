import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import SCREENS from '@src/SCREENS';

// Admin membership checks require numeric IDs even when navigation starts from a URL string.
import {findFocusedRoute} from '@react-navigation/native';

describe('Domain admin details routing', () => {
    it.each(['domain/100/admins/300', '/domain/100/admins/300'])('parses numeric IDs from %s', (path) => {
        // Given a URL whose account IDs arrive as strings
        // When the real navigation parser resolves the admin details route
        const route = findFocusedRoute(getStateFromPath(path));

        // Then membership checks and revoke actions receive numeric IDs
        expect(route).toMatchObject({
            name: SCREENS.DOMAIN.ADMIN_DETAILS,
            params: {domainAccountID: 100, accountID: 300},
        });
    });
});
