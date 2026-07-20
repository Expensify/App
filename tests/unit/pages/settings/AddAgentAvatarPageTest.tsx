import {render, waitFor} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import AddAgentAvatarPage from '@pages/settings/Agents/Fields/AddAgentAvatarPage';
import type {OnSaveParams} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';

const mockSetNewAgentUploadedAvatar = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());
const mockSetNewAgentAvatarPreset = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());
const mockLogWarn = jest.fn<void, unknown[]>();
const mockIsFocused = jest.fn<boolean, []>(() => true);

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useNavigation: () => ({isFocused: mockIsFocused}),
}));

jest.mock('@userActions/Agent', () => ({
    setNewAgentUploadedAvatar: (...args: unknown[]) => mockSetNewAgentUploadedAvatar(...args),
    setNewAgentAvatarPreset: (...args: unknown[]) => mockSetNewAgentAvatarPreset(...args),
}));

jest.mock('@libs/Log', () => ({
    warn: (...args: unknown[]) => mockLogWarn(...args),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

let mockEditAgentAvatarOnSave: jest.Mock | undefined;

jest.mock('@pages/settings/Agents/Fields/EditAgentAvatarPage', () => ({
    EditAgentAvatarContent: jest.fn((props: {onSave?: (params: OnSaveParams) => void; initialPresetID?: string}) => {
        mockEditAgentAvatarOnSave = props.onSave ? jest.fn(props.onSave) : undefined;
        return null;
    }),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

const mockGoBack = jest.mocked(Navigation.goBack);
const mockUseOnyx = jest.mocked(useOnyx);
const MOCK_FILE = {uri: 'file://photo.jpg', name: 'photo.jpg'} as unknown as File;

describe('AddAgentAvatarPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEditAgentAvatarOnSave = undefined;
        mockSetNewAgentUploadedAvatar.mockResolvedValue();
        mockSetNewAgentAvatarPreset.mockResolvedValue();
        mockIsFocused.mockReturnValue(true);
        mockUseOnyx.mockReturnValue([{customExpensifyAvatarID: 'bot-avatar--blue'}, {status: 'loaded'}]);
    });

    it('passes the persisted preset ID from the Onyx draft to EditAgentAvatarContent', () => {
        const {EditAgentAvatarContent} = jest.requireMock<{EditAgentAvatarContent: jest.Mock}>('@pages/settings/Agents/Fields/EditAgentAvatarPage');

        render(<AddAgentAvatarPage />);

        expect(mockUseOnyx).toHaveBeenCalledWith(ONYXKEYS.AGENT_NEW_AVATAR_DRAFT);
        expect(EditAgentAvatarContent).toHaveBeenCalledWith(
            expect.objectContaining({
                initialPresetID: 'bot-avatar--blue',
            }),
            undefined,
        );
    });

    it('stores preset avatar in the Onyx draft and navigates back when save is called with a preset ID', async () => {
        render(<AddAgentAvatarPage />);

        mockEditAgentAvatarOnSave?.({customExpensifyAvatarID: 'bot-avatar--blue'});

        expect(mockSetNewAgentAvatarPreset).toHaveBeenCalledWith('bot-avatar--blue');
        expect(mockSetNewAgentUploadedAvatar).not.toHaveBeenCalled();
        await waitFor(() => expect(mockGoBack).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD.getRoute()));
    });

    it('serializes the uploaded file into the Onyx draft and navigates back when save is called with a file', async () => {
        render(<AddAgentAvatarPage />);

        mockEditAgentAvatarOnSave?.({file: MOCK_FILE, uri: 'file://photo.jpg'});

        expect(mockSetNewAgentUploadedAvatar).toHaveBeenCalledWith(MOCK_FILE);
        expect(mockSetNewAgentAvatarPreset).not.toHaveBeenCalled();
        await waitFor(() => expect(mockGoBack).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD.getRoute()));
    });

    it('waits for the uploaded-photo write to persist before navigating back', async () => {
        let resolveWrite: () => void = () => {};
        mockSetNewAgentUploadedAvatar.mockReturnValueOnce(
            new Promise<void>((resolve) => {
                resolveWrite = resolve;
            }),
        );

        render(<AddAgentAvatarPage />);
        mockEditAgentAvatarOnSave?.({file: MOCK_FILE, uri: 'file://photo.jpg'});

        // Navigation must not happen until the async serialization/write has resolved.
        expect(mockGoBack).not.toHaveBeenCalled();

        resolveWrite();

        await waitFor(() => expect(mockGoBack).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD.getRoute()));
    });

    it('logs a warning and still navigates back when the draft write fails', async () => {
        mockSetNewAgentUploadedAvatar.mockReturnValueOnce(Promise.reject(new Error('boom')));

        render(<AddAgentAvatarPage />);
        mockEditAgentAvatarOnSave?.({file: MOCK_FILE, uri: 'file://photo.jpg'});

        await waitFor(() => expect(mockGoBack).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD.getRoute()));
        expect(mockLogWarn).toHaveBeenCalledTimes(1);
        expect(mockLogWarn.mock.calls.at(0)?.at(0)).toBe('Failed to persist the new-agent avatar draft');
    });

    it('skips navigation when the user already left the screen while the write was pending', async () => {
        let resolveWrite: () => void = () => {};
        mockSetNewAgentUploadedAvatar.mockReturnValueOnce(
            new Promise<void>((resolve) => {
                resolveWrite = resolve;
            }),
        );

        render(<AddAgentAvatarPage />);
        mockEditAgentAvatarOnSave?.({file: MOCK_FILE, uri: 'file://photo.jpg'});

        // The user leaves the avatar picker before the draft write settles.
        mockIsFocused.mockReturnValue(false);
        resolveWrite();

        await waitFor(() => expect(mockIsFocused).toHaveBeenCalled());
        expect(mockGoBack).not.toHaveBeenCalled();
    });
});
