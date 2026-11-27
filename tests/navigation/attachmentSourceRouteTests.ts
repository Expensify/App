import {getValidatedImageSource} from '@libs/AvatarUtils';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

// The attachment route encodes the source once and navigation decodes it once, so the modal must receive the original URL.
describe('Attachment source route', () => {
    it.each([
        ['an ordinary URL', 'https://www.expensify.com/chat-attachments/123/w_abc.jpg'],
        ['a literal %23', 'https://example.com/images/report%23123.png'],
        ['a literal %25', 'https://example.com/images/100%25.png'],
        ['a space escape', 'https://example.com/images/my%20receipt.png'],
        ['a truncated multi-byte escape', 'https://example.com/images/price%E2%82.png'],
    ])('opens the attachment modal with %s in the source unchanged', (_, source) => {
        // Given an attachment route built from a source URL
        const path = ROUTES.REPORT_ATTACHMENTS.getRoute({source, type: CONST.ATTACHMENT_TYPE.REPORT, reportID: '1'});

        // When navigation parses the route and the attachment modal validates the source
        const route = findFocusedRoute(getStateFromPath(path));
        const params = route?.params;
        const routeSource = params && 'source' in params && typeof params.source === 'string' ? params.source : undefined;
        const validatedSource = getValidatedImageSource(routeSource, false);

        // Then the modal opens the same file that was linked
        expect(route?.name).toBe(SCREENS.REPORT_ATTACHMENTS);
        expect(validatedSource).toBe(source);
    });
});
