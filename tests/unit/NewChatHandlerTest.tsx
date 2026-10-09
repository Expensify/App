import {act, render} from '@testing-library/react-native';

import KeyboardShortcut from '@libs/KeyboardShortcut';
import NewChatHandler from '@libs/Navigation/AppNavigator/KeyboardShortcutsHandler/NewChatHandler';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockShortcutCallback: (() => void) | undefined;

jest.mock('@libs/KeyboardShortcut', () => ({
    subscribe: jest.fn((_key: string, callback: () => void) => {
        mockShortcutCallback = callback;
        return jest.fn();
    }),
}));

jest.mock('@hooks/useShouldShowRequire2FAPage', () => ({
    __esModule: true,
    default: () => false,
}));

describe('NewChatHandler', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        mockShortcutCallback = undefined;
        jest.spyOn(Navigation, 'isOnboardingFlow').mockReturnValue(false);
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
    });

    it('clears a leftover group chat draft before opening Start chat', async () => {
        // Given a group chat draft left behind after the user dismissed the group creation flow
        await act(async () => {
            await Onyx.set(ONYXKEYS.NEW_GROUP_CHAT_DRAFT, {
                participants: [{accountID: 1, login: 'test@example.com'}],
                reportName: null,
                avatarUri: null,
                avatarFileName: null,
                avatarFileType: null,
            });
        });
        expect(await getOnyxValue(ONYXKEYS.NEW_GROUP_CHAT_DRAFT)).toBeDefined();

        render(<NewChatHandler />);
        expect(KeyboardShortcut.subscribe).toHaveBeenCalledTimes(1);

        // When the user opens Start chat with the CMD/CTRL+SHIFT+K shortcut
        act(() => {
            mockShortcutCallback?.();
        });
        await waitForBatchedUpdatesWithAct();

        // Then the old draft is cleared so the abandoned group can't be restored and confirmed, matching the FAB entry point
        expect(await getOnyxValue(ONYXKEYS.NEW_GROUP_CHAT_DRAFT)).toBeUndefined();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.NEW);
    });
});
