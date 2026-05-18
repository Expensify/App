import {render} from '@testing-library/react-native';
import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import AddAgentAvatarPage from '@pages/settings/Agents/Fields/AddAgentAvatarPage';
import type {OnSaveParams} from '@pages/settings/Agents/Fields/EditAgentAvatarPage';
import ROUTES from '@src/ROUTES';

const mockConsumeNavigationToken = jest.fn<boolean, []>();
const mockGetInitialPresetID = jest.fn<string | undefined, []>(() => undefined);
const mockSetPendingAvatar = jest.fn<void, unknown[]>();

jest.mock('@pages/settings/Agents/pendingAgentAvatarStore', () => ({
    consumeNavigationToken: () => mockConsumeNavigationToken(),
    getInitialPresetID: () => mockGetInitialPresetID(),
    setPendingAvatar: (...args: unknown[]) => mockSetPendingAvatar(...args),
}));

let mockEditAgentAvatarOnSave: jest.Mock | undefined;

jest.mock('@pages/settings/Agents/Fields/EditAgentAvatarPage', () => ({
    EditAgentAvatarContent: jest.fn((props: {onSave?: (params: OnSaveParams) => void}) => {
        mockEditAgentAvatarOnSave = props.onSave ? jest.fn(props.onSave) : undefined;
        return null;
    }),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

const mockNavigate = jest.mocked(Navigation.navigate);
const mockGoBack = jest.mocked(Navigation.goBack);

describe('AddAgentAvatarPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEditAgentAvatarOnSave = undefined;
    });

    it('redirects to the add agent route when navigation token is absent', () => {
        mockConsumeNavigationToken.mockReturnValue(false);

        render(<AddAgentAvatarPage />);

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD);
    });

    it('does not redirect when navigation token is present', () => {
        mockConsumeNavigationToken.mockReturnValue(true);

        render(<AddAgentAvatarPage />);

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('stores preset avatar and navigates back when save is called with a preset ID', () => {
        mockConsumeNavigationToken.mockReturnValue(true);

        render(<AddAgentAvatarPage />);

        mockEditAgentAvatarOnSave?.({customExpensifyAvatarID: 'bot-avatar--blue'});

        expect(mockSetPendingAvatar).toHaveBeenCalledWith({type: 'preset', id: 'bot-avatar--blue'});
        expect(mockGoBack).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD);
    });

    it('stores file avatar and navigates back when save is called with a file', () => {
        mockConsumeNavigationToken.mockReturnValue(true);
        const mockFile = {uri: 'file://photo.jpg', name: 'photo.jpg'} as unknown as File;

        render(<AddAgentAvatarPage />);

        mockEditAgentAvatarOnSave?.({file: mockFile, uri: 'file://photo.jpg'});

        expect(mockSetPendingAvatar).toHaveBeenCalledWith({type: 'file', file: mockFile, uri: 'file://photo.jpg'});
        expect(mockGoBack).toHaveBeenCalledWith(ROUTES.SETTINGS_AGENTS_ADD);
    });
});
