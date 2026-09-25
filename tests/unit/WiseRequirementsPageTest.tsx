import {act, fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import EmbeddedWisePage from '@pages/settings/Wallet/EnableGlobalReimbursements/requirements/EmbeddedWisePage.native';
import RequirementFormPage from '@pages/settings/Wallet/EnableGlobalReimbursements/requirements/RequirementFormPage';
import RequirementsPage from '@pages/settings/Wallet/EnableGlobalReimbursements/requirements/RequirementsPage';

import {getWiseKYCRequirements, getWiseKYCReviewEmbeddedLink, submitWiseKYCRequirement} from '@userActions/BankAccounts/wise';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WiseKYCRequirementForm} from '@src/types/form';

import type ReactNative from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import kycRequirements from '../fixtures/wise/kycRequirements';
import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/BankAccounts/wise', () => ({
    getWiseKYCRequirements: jest.fn(),
    getWiseKYCReviewEmbeddedLink: jest.fn(),
    submitWiseKYCRequirement: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

const mockRouteParams: {subPage?: string; action?: 'edit'} = {};

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: mockRouteParams})),
        useNavigation: jest.fn(() => ({addListener: jest.fn(() => jest.fn()), getState: jest.fn(() => ({routes: []})), isFocused: () => true, setParams: jest.fn()})),
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        preferredLocale: 'en',
    })),
);

jest.mock('react-native-webview', () => ({WebView: jest.fn(() => null)}));

jest.mock('@components/UploadFile', () => {
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    function MockUploadFile() {
        return <RN.View testID="upload-file" />;
    }
    return {__esModule: true, default: MockUploadFile};
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader() {
        return null;
    }
    return MockHeader;
});

jest.mock('@src/utils/keyboard', () => ({
    dismiss: jest.fn(() => Promise.resolve()),
    dismissKeyboardAndExecute: jest.fn((callback: () => void) => callback()),
}));

const BANK_ACCOUNT_ID = 123;

type ListRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENTS>['route'];
type ListNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENTS>['navigation'];
type FormRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENT_FORM>['route'];
type EmbeddedRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_EMBEDDED>['route'];
type EmbeddedNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_EMBEDDED>['navigation'];
type FormNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENT_FORM>['navigation'];

async function renderRequirementsPage() {
    render(
        <RequirementsPage
            route={createMock<ListRoute>({params: {bankAccountID: String(BANK_ACCOUNT_ID)}})}
            navigation={createMock<ListNavigation>({})}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

async function renderRequirementFormPage(requirementKey: string) {
    render(
        <RequirementFormPage
            route={createMock<FormRoute>({params: {bankAccountID: String(BANK_ACCOUNT_ID), requirementKey}})}
            navigation={createMock<FormNavigation>({})}
        />,
    );
    await waitForBatchedUpdatesWithAct();
}

function countRenderedRequirements() {
    return screen.getAllByText(/^wiseKYC\.requirement\./).length;
}

describe('Wise KYC requirements pages', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        delete mockRouteParams.subPage;
        delete mockRouteParams.action;
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.WISE_KYC_REQUIREMENTS, kycRequirements);
        });
    });

    it('renders one task per requirement', async () => {
        await renderRequirementsPage();

        expect(countRenderedRequirements()).toBe(3);
        expect(screen.getByText('wiseKYC.requirement.ACCOUNT_PURPOSE')).toBeOnTheScreen();
        expect(screen.getByText('wiseKYC.requirement.ID_DOCUMENT')).toBeOnTheScreen();
        expect(screen.getByText('wiseKYC.requirement.LIVENESS_CHECK')).toBeOnTheScreen();
        expect(screen.getAllByText('wiseKYC.state.NOT_PROVIDED')).toHaveLength(3);
    });

    it('renders a form for a requirement with fields and submits it from the page, with no confirmation for a one-page form', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM_DRAFT, {accountPurpose: 'PAYING_BILLS'});
        });
        mockRouteParams.subPage = 'account-purpose';
        await renderRequirementFormPage('ACCOUNT_PURPOSE');

        expect(screen.getByText('Paying bills')).toBeOnTheScreen();

        expect(screen.queryByText('common.next')).not.toBeOnTheScreen();
        fireEvent.press(screen.getByText('common.confirm'));
        await waitForBatchedUpdatesWithAct();
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENT_FORM.getRoute(BANK_ACCOUNT_ID, 'ACCOUNT_PURPOSE', 'confirm'));

        expect(submitWiseKYCRequirement).toHaveBeenCalledTimes(1);
        expect(submitWiseKYCRequirement).toHaveBeenCalledWith(BANK_ACCOUNT_ID, 'ACCOUNT_PURPOSE', expect.objectContaining({accountPurpose: 'PAYING_BILLS'}), expect.any(Array));
        expect(Navigation.goBack).not.toHaveBeenCalled();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, {isLoading: true});
        });
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, {isLoading: false, errors: {wiseError: 'Wise rejected the answer'}});
        });
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(screen.getByText('Wise rejected the answer')).toBeOnTheScreen();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, {isLoading: true, errors: null});
        });
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, {isLoading: false});
            await Onyx.set(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM_DRAFT, null);
        });
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(BANK_ACCOUNT_ID));
    });

    it('shows one uploader for passport and two for ID card', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM_DRAFT, {documentType: 'PASSPORT'});
        });
        mockRouteParams.subPage = 'identity-document';
        await renderRequirementFormPage('ID_DOCUMENT');
        expect(screen.getAllByTestId('upload-file')).toHaveLength(1);

        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM_DRAFT, {documentType: 'ID_CARD'});
        });
        screen.unmount();
        await renderRequirementFormPage('ID_DOCUMENT');
        expect(screen.getAllByTestId('upload-file')).toHaveLength(2);

        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM_DRAFT, {documentType: 'RESIDENCE_PERMIT'});
        });
        screen.unmount();
        await renderRequirementFormPage('ID_DOCUMENT');
        expect(screen.getAllByTestId('upload-file')).toHaveLength(2);
    });

    it('opens the embedded page for a hostedOnly requirement', async () => {
        await renderRequirementsPage();

        fireEvent.press(screen.getByText('wiseKYC.requirement.LIVENESS_CHECK'), {nativeEvent: {}});

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_WISE_KYC_EMBEDDED.getRoute(BANK_ACCOUNT_ID));
    });

    it('fetches the embedded Wise link when the embedded page mounts', async () => {
        render(
            <EmbeddedWisePage
                route={createMock<EmbeddedRoute>({params: {bankAccountID: String(BANK_ACCOUNT_ID)}})}
                navigation={createMock<EmbeddedNavigation>({})}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(getWiseKYCReviewEmbeddedLink).toHaveBeenCalledWith(BANK_ACCOUNT_ID);
    });

    it('sends a form URL for a hosted-only or unknown requirement back to the list once the list has loaded', async () => {
        mockRouteParams.subPage = 'liveness-check';
        await renderRequirementFormPage('LIVENESS_CHECK');
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(BANK_ACCOUNT_ID));

        screen.unmount();
        jest.clearAllMocks();
        await renderRequirementFormPage('NOT_A_REQUIREMENT');
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(BANK_ACCOUNT_ID));
        expect(getWiseKYCRequirements).not.toHaveBeenCalled();
    });

    it('shows a loading indicator and fetches requirements when the form page mounts on an empty cache', async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.WISE_KYC_REQUIREMENTS, null);
        });
        mockRouteParams.subPage = 'account-purpose';

        await renderRequirementFormPage('ACCOUNT_PURPOSE');

        expect(getWiseKYCRequirements).toHaveBeenCalledWith(BANK_ACCOUNT_ID);
        expect(screen.queryByText('common.confirm')).not.toBeOnTheScreen();

        await act(async () => {
            await Onyx.set(ONYXKEYS.WISE_KYC_REQUIREMENTS, kycRequirements);
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('common.confirm')).toBeOnTheScreen();
    });

    it('clears a previous submit error when opening a requirement', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, {errors: {wiseError: 'Rejected'}});
        });
        await renderRequirementsPage();

        fireEvent.press(screen.getByText('wiseKYC.requirement.ID_DOCUMENT'), {nativeEvent: {}});
        await waitForBatchedUpdatesWithAct();

        const form = await new Promise<OnyxEntry<WiseKYCRequirementForm>>((resolve) => {
            const connection = Onyx.connect({
                key: ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });
        expect(form?.errors).toBeFalsy();
    });

    it('replaces the task list when the Onyx key changes', async () => {
        await renderRequirementsPage();
        expect(countRenderedRequirements()).toBe(3);

        await act(async () => {
            await Onyx.set(ONYXKEYS.WISE_KYC_REQUIREMENTS, kycRequirements.slice(1, 2));
        });
        await waitForBatchedUpdatesWithAct();

        expect(countRenderedRequirements()).toBe(1);
        expect(screen.getByText('wiseKYC.requirement.ID_DOCUMENT')).toBeOnTheScreen();
    });
});
