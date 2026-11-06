import {renderHook, waitFor} from '@testing-library/react-native';

import useContactPermissionModal from '@hooks/useContactPermissionModal/index.native';

import {getContactPermission} from '@libs/ContactPermission';

import {RESULTS} from 'react-native-permissions';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import {mockShowConfirmModal, resetMockConfirmModal} from '../../utils/mockUseConfirmModal';

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({ToddWithPhones: 'ToddWithPhones'}),
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    mb0: {},
    mb4: {},
    mt2: {},
    textHeadline: {},
    textLabelSupportingEmptyValue: {},
}));

jest.mock('@hooks/useOnyx', () => () => [false, {status: 'loaded'}]);

jest.mock('@libs/actions/ContactPermissions', () => ({
    setHasDeniedContactImportPrompt: jest.fn(),
}));

jest.mock('@libs/ContactPermission', () => ({
    getContactPermission: jest.fn(),
    requestContactPermission: jest.fn(),
}));

const mockGetContactPermission = jest.mocked(getContactPermission);

function renderContactPermissionModal(isEnabled?: boolean) {
    const params = {onDeny: jest.fn(), onGrant: jest.fn(), onFocusTextInput: jest.fn(), isEnabled};
    return {params, ...renderHook(() => useContactPermissionModal(params))};
}

describe('useContactPermissionModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        // Contacts permission hasn't been asked yet, which is when the prompt normally shows.
        mockGetContactPermission.mockResolvedValue(RESULTS.DENIED);
    });

    it('shows the import contacts prompt when contacts permission has not been asked yet', async () => {
        // Given the prompt is enabled (the default) and contacts permission hasn't been asked yet
        // When the hook mounts
        renderContactPermissionModal();

        // Then the import contacts prompt opens
        await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
    });

    it('does not show the prompt when it is disabled, and focuses the text input instead', async () => {
        // Given a picker that turned the prompt off, as the share flow does
        // When the hook mounts
        const {params} = renderContactPermissionModal(false);

        // Then the text input is focused as if the prompt weren't needed
        await waitFor(() => expect(params.onFocusTextInput).toHaveBeenCalledTimes(1));

        // And neither the prompt nor the permission check runs
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(mockGetContactPermission).not.toHaveBeenCalled();
    });
});
