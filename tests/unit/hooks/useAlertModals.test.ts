import {renderHook} from '@testing-library/react-native';

import useAlertModals from '@hooks/useAlertModals';

const mockShowDecisionModal = jest.fn();
jest.mock('@hooks/useDecisionModal', () => ({
    __esModule: true,
    default: () => ({showDecisionModal: mockShowDecisionModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

describe('useAlertModals', () => {
    beforeEach(() => {
        mockShowDecisionModal.mockClear();
    });

    it('shows the one-button offline alert', () => {
        // Given the hook is rendered
        const {result} = renderHook(() => useAlertModals());

        // When the offline alert is requested
        result.current.showOfflineModal();

        // Then the global decision modal shows the offline copy with a single confirm button, matching the local modals it replaced
        expect(mockShowDecisionModal).toHaveBeenCalledTimes(1);
        expect(mockShowDecisionModal).toHaveBeenCalledWith({
            title: 'common.youAppearToBeOffline',
            prompt: 'common.offlinePrompt',
            secondOptionText: 'common.buttonConfirm',
        });
    });

    it('shows the one-button download failed alert', () => {
        // Given the hook is rendered
        const {result} = renderHook(() => useAlertModals());

        // When the download failed alert is requested
        result.current.showDownloadErrorModal();

        // Then the global decision modal shows the download failed copy with a single confirm button, matching the local modals it replaced
        expect(mockShowDecisionModal).toHaveBeenCalledTimes(1);
        expect(mockShowDecisionModal).toHaveBeenCalledWith({
            title: 'common.downloadFailedTitle',
            prompt: 'common.downloadFailedDescription',
            secondOptionText: 'common.buttonConfirm',
        });
    });
});
