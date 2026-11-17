import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import useConfirmModal from '@hooks/useConfirmModal';
import useNetwork from '@hooks/useNetwork';
import useSwitchToClassic from '@hooks/useSwitchToClassic';

import {maskOnyxState, readOnyxState, saveOnyxStateFile} from '@libs/ExportOnyxState';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';

import TroubleshootPage from '@pages/settings/Troubleshoot/TroubleshootPage';

import {subDays} from 'date-fns';
import React from 'react';

const mockShowConfirmModal = jest.fn();
const mockLogWarn = jest.fn<void, [string, Record<string, unknown>]>();

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
let mockTryNewDot: unknown;
jest.mock('@hooks/useOnyx', () => jest.fn((key: string) => [key === 'nvp_tryNewDot' ? mockTryNewDot : undefined, {status: 'loaded'}]));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useSwitchToClassic', () => jest.fn());
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
            disabled?: boolean;
        }>;
    }) => {
        const ReactModule = jest.requireActual<typeof React>('react');
        return menuItems.map((item) =>
            ReactModule.createElement(
                'Text',
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: item.title,
                    accessibilityState: {disabled: !!item.disabled},
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
}));
jest.mock('@libs/actions/HybridApp', () => ({
    closeReactNativeApp: jest.fn(),
}));
jest.mock('@libs/actions/MaskOnyx', () => ({
    setShouldMaskOnyxState: jest.fn(),
}));
jest.mock('@libs/actions/User', () => ({
    openTroubleshootSettingsPage: jest.fn(),
}));
jest.mock('@libs/ExportOnyxState', () => ({
    maskOnyxState: jest.fn(),
    readOnyxState: jest.fn(),
    saveOnyxStateFile: jest.fn(),
}));
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {warn: (message: string, extraData: Record<string, unknown>) => mockLogWarn(message, extraData)},
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
jest.mock('@userActions/Welcome', () => ({resetAllChecks: jest.fn()}));
jest.mock('@pages/settings/Troubleshoot/useTroubleshootSectionIllustration', () => jest.fn(() => ({})));

const mockSwitchToClassic = jest.fn();

const exportButtonName = 'initialSettingsPage.troubleshoot.exportOnyxState';
const goToClassicButtonName = 'exitSurvey.goToExpensifyClassic';
const exportedState = {test: {value: 1}};
const maskedState = {test: {value: 0}};

function arrangeSwitchToClassic(isSwitchingToClassic: boolean) {
    jest.mocked(useSwitchToClassic).mockReturnValue({switchToClassic: mockSwitchToClassic, isSwitchingToClassic});
}

describe('TroubleshootPage Onyx export', () => {
    beforeEach(() => {
        arrangeSwitchToClassic(false);
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
        jest.mocked(saveOnyxStateFile).mockResolvedValue(undefined);
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
        expect(mockLogWarn).toHaveBeenCalledWith('[Troubleshoot] Unable to export Onyx state', {error: error.message});
    }

    it('saves the masked Onyx state', async () => {
        render(React.createElement(TroubleshootPage));

        fireEvent.press(screen.getByRole('button', {name: exportButtonName}));

        await waitFor(() => {
            expect(saveOnyxStateFile).toHaveBeenCalledWith(JSON.stringify(maskedState));
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

    it('shows an error when saving Onyx state fails', async () => {
        const error = new Error('Saving failed');
        jest.mocked(saveOnyxStateFile).mockRejectedValueOnce(error);

        await expectExportFailureModal(error);
    });
});

describe('TroubleshootPage switch to Classic', () => {
    beforeEach(() => {
        jest.mocked(useConfirmModal).mockReturnValue({
            showModal: jest.fn(() => Promise.resolve({action: 'CLOSE'} as const)),
            resolveModal: jest.fn(),
            showConfirmModal: mockShowConfirmModal,
            closeModal: jest.fn(),
            closeModalByID: jest.fn(),
        });
        arrangeSwitchToClassic(false);
        jest.mocked(shouldHideOldAppRedirect).mockReturnValue(false);

        // The user took the exit survey yesterday, so Troubleshoot switches without asking again
        mockTryNewDot = {classicRedirect: {dismissed: true, dismissedReasons: [{reason: 'Too many clicks', timestamp: subDays(new Date(), 1)}]}};
    });

    afterEach(() => {
        mockTryNewDot = undefined;
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        jest.mocked(shouldHideOldAppRedirect).mockReturnValue(true);
        jest.clearAllMocks();
    });

    it('records the switch, which opens Classic once the server saves it', () => {
        // Given a user who completed the exit survey within the last month
        render(React.createElement(TroubleshootPage));

        // When they choose to go to Classic
        fireEvent.press(screen.getByRole('button', {name: goToClassicButtonName}));

        // Then the switch is recorded with an empty response, since the survey isn't shown again
        expect(mockSwitchToClassic).toHaveBeenCalledWith('');
    });

    it('disables the entry while offline', () => {
        // Given a user who is offline, so the server can't save the switch
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});

        // When the page renders
        render(React.createElement(TroubleshootPage));

        // Then going to Classic is disabled
        expect(screen.getByRole('button', {name: goToClassicButtonName})).toBeDisabled();
    });

    it('keeps the entry enabled offline when it only opens the exit survey', () => {
        // Given an offline user who hasn't taken the exit survey recently, so the entry opens the survey instead of switching
        mockTryNewDot = undefined;
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});

        // When the page renders
        render(React.createElement(TroubleshootPage));

        // Then the user can still open the survey, like from Settings
        expect(screen.getByRole('button', {name: goToClassicButtonName})).toBeEnabled();
    });

    it('disables the entry while a switch is waiting for the server', () => {
        // Given a switch already sent from this page
        arrangeSwitchToClassic(true);

        // When the page renders
        render(React.createElement(TroubleshootPage));

        // Then the user can't send another one
        expect(screen.getByRole('button', {name: goToClassicButtonName})).toBeDisabled();
    });
});
