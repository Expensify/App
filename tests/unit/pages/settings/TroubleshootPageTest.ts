import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import useConfirmModal from '@hooks/useConfirmModal';

import {maskOnyxState, readOnyxState, shareAsFile} from '@libs/ExportOnyxState';

import TroubleshootPage from '@pages/settings/Troubleshoot/TroubleshootPage';

import React from 'react';

const mockShowConfirmModal = jest.fn();
const mockLogAlert = jest.fn<void, [string, Record<string, unknown>]>();

jest.mock('@hooks/useConfirmModal', () => jest.fn());
jest.mock('@hooks/useDocumentTitle', () => jest.fn());
jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({isDevelopment: false})));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        Download: 'download',
        ExpensifyLogoNew: 'logo',
        RotateLeft: 'reset',
    })),
}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryActions: jest.fn(() => ({
        setShouldResetSearchQuery: jest.fn(),
    })),
}));
jest.mock('@components/Modal/Global/ModalContext', () => ({
    ModalActions: {CONFIRM: 'CONFIRM', CLOSE: 'CLOSE'},
}));
jest.mock('@components/ActivityIndicator', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ImportOnyxState', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/Section',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/SectionSubtitleHTML', () => () => null);
jest.mock('@components/SentryDebugToolMenu', () => () => null);
jest.mock('@components/Switch', () => () => null);
jest.mock('@components/TestToolMenu', () => () => null);
jest.mock(
    '@components/TestToolRow',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/MenuItemList', () => ({
    __esModule: true,
    default: ({
        menuItems,
    }: {
        menuItems: Array<{
            key: string;
            title: string;
            onPress: () => void | Promise<void>;
        }>;
    }) => {
        const ReactModule = jest.requireActual<typeof React>('react');
        return menuItems.map((item) =>
            ReactModule.createElement(
                'Text',
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: item.title,
                    key: item.key,
                    onPress: item.onPress,
                },
                item.title,
            ),
        );
    },
}));

jest.mock('@libs/actions/ExitSurvey', () => ({
    resetExitSurveyForm: jest.fn(),
    switchToOldDot: jest.fn(),
}));
jest.mock('@libs/actions/HybridApp', () => ({
    closeReactNativeApp: jest.fn(),
}));
jest.mock('@libs/actions/Link', () => ({openOldDotLink: jest.fn()}));
jest.mock('@libs/actions/MaskOnyx', () => ({
    setShouldMaskOnyxState: jest.fn(),
}));
jest.mock('@libs/actions/User', () => ({
    openTroubleshootSettingsPage: jest.fn(),
}));
jest.mock('@libs/ExportOnyxState', () => ({
    maskOnyxState: jest.fn(),
    readOnyxState: jest.fn(),
    shareAsFile: jest.fn(),
}));
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {alert: (message: string, extraData: Record<string, unknown>) => mockLogAlert(message, extraData)},
}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@libs/TryNewDotUtils', () => ({
    shouldHideOldAppRedirect: jest.fn(() => true),
}));
jest.mock('@userActions/App', () => ({clearOnyxAndResetApp: jest.fn()}));
jest.mock('@pages/settings/Troubleshoot/useTroubleshootSectionIllustration', () => jest.fn(() => ({})));

const exportButtonName = 'initialSettingsPage.troubleshoot.exportOnyxState';
const exportedState = {test: {value: 1}};
const maskedState = {test: {value: 0}};

describe('TroubleshootPage Onyx export', () => {
    beforeEach(() => {
        jest.mocked(useConfirmModal).mockReturnValue({
            showModal: jest.fn(() => Promise.resolve({action: 'CLOSE'} as const)),
            resolveModal: jest.fn(),
            showConfirmModal: mockShowConfirmModal,
            closeModal: jest.fn(),
            closeModalByID: jest.fn(),
        });
        mockShowConfirmModal.mockResolvedValue({action: 'CLOSE'});
        jest.mocked(readOnyxState).mockResolvedValue(exportedState);
        jest.mocked(maskOnyxState).mockReturnValue(maskedState);
        jest.mocked(shareAsFile).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    async function expectExportFailureModal(error: Error) {
        render(React.createElement(TroubleshootPage));

        fireEvent.press(screen.getByRole('button', {name: exportButtonName}));

        await waitFor(() => {
            expect(mockShowConfirmModal).toHaveBeenCalledWith({
                title: 'genericErrorPage.title',
                prompt: 'common.genericErrorMessage',
                confirmText: 'common.ok',
                shouldShowCancelButton: false,
            });
        });
        expect(mockLogAlert).toHaveBeenCalledWith('[Troubleshoot] Unable to export Onyx state', {error});
    }

    it('shares the masked Onyx state', async () => {
        render(React.createElement(TroubleshootPage));

        fireEvent.press(screen.getByRole('button', {name: exportButtonName}));

        await waitFor(() => {
            expect(shareAsFile).toHaveBeenCalledWith(JSON.stringify(maskedState));
        });
        expect(maskOnyxState).toHaveBeenCalledWith(exportedState, true);
    });

    it('shows an error when reading Onyx state fails', async () => {
        const error = new Error('Storage read failed');
        jest.mocked(readOnyxState).mockRejectedValueOnce(error);

        await expectExportFailureModal(error);
    });

    it('shows an error when masking Onyx state fails', async () => {
        const error = new Error('Masking failed');
        jest.mocked(maskOnyxState).mockImplementationOnce(() => {
            throw error;
        });

        await expectExportFailureModal(error);
    });

    it('shows an error when sharing Onyx state fails', async () => {
        const error = new Error('Sharing failed');
        jest.mocked(shareAsFile).mockRejectedValueOnce(error);

        await expectExportFailureModal(error);
    });
});
