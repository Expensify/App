import {renderHook} from '@testing-library/react-native';

import useMergeResultConfirmationConfig from '@hooks/useMergeResultConfirmationConfig';
import useOnyx from '@hooks/useOnyx';

import type CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';

import createMock from '../../utils/createMock';

jest.mock('@components/ConfirmationPage', () => () => null);
jest.mock('@components/LottieAnimations', () => ({Fireworks: 'fireworks'}));
jest.mock('@components/RenderHTML', () => () => null);
jest.mock('@components/Text', () => () => null);
jest.mock('@components/TextLink', () => () => null);
jest.mock('@hooks/useEnvironment', () => () => ({environmentURL: 'https://example.com'}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: () => ({RunningTurtle: 'turtle', LockClosedOrange: 'lock'})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useScreenBoundDynamicRoute', () => () => () => 'settings/contact-methods');
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@userActions/HybridApp', () => ({closeReactNativeApp: jest.fn()}));
jest.mock('@userActions/Link', () => ({openOldDotLink: jest.fn()}));
jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {...jest.requireActual<{default: typeof CONFIG}>('@src/CONFIG').default, IS_HYBRID_APP: true},
}));

describe('useMergeResultConfirmationConfig Classic eligibility', () => {
    let tryNewDot: TryNewDot | undefined;
    let isLoadingApp: boolean;

    beforeEach(() => {
        tryNewDot = undefined;
        isLoadingApp = true;
        jest.mocked(useOnyx).mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.NVP_TRY_NEW_DOT:
                    return [tryNewDot, {status: 'loaded'}];
                case ONYXKEYS.IS_LOADING_APP:
                    return [isLoadingApp, {status: 'loaded'}];
                default:
                    return [undefined, {status: 'loaded'}];
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function renderConfig() {
        return renderHook(() => useMergeResultConfirmationConfig({result: CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED, login: 'merge@example.com'}));
    }

    it('hides the Classic CTA while an absent NVP is still loading from OpenApp', () => {
        // Given cleared NVP data with loaded storage metadata and OpenApp still loading
        // When the SAML merge result builds its Classic CTA
        const {result} = renderConfig();

        // Then it does not offer an action that the exit guard would block
        expect(result.current.shouldShowSecondaryButton).toBe(false);
    });

    it('keeps the Classic CTA hidden when OpenApp returns a blocked account', () => {
        // Given a hidden CTA while Classic eligibility is unresolved
        const {result, rerender} = renderConfig();
        expect(result.current.shouldShowSecondaryButton).toBe(false);

        // When OpenApp returns the account lock without any tap
        tryNewDot = createMock<TryNewDot>({isLockedToNewApp: true});
        isLoadingApp = false;
        rerender({});

        // Then the existing lock continues to hide Classic
        expect(result.current.shouldShowSecondaryButton).toBe(false);
    });

    it('shows the Classic CTA after OpenApp finishes without an NVP', () => {
        // Given an eligible account whose optional NVP is absent
        const {result, rerender} = renderConfig();
        expect(result.current.shouldShowSecondaryButton).toBe(false);

        // When OpenApp finishes without supplying an NVP
        isLoadingApp = false;
        rerender({});

        // Then the eligible account can switch to Classic
        expect(result.current.shouldShowSecondaryButton).toBe(true);
    });
});
