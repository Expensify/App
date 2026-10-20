import {render, waitFor} from '@testing-library/react-native';

import CONST from '@src/CONST';
import HybridAppHandler from '@src/HybridAppHandler';
import type HybridAppSettings from '@src/libs/actions/HybridApp/types';

import React from 'react';

const mockGetHybridAppSettings = jest.fn<Promise<HybridAppSettings | null>, []>(() => Promise.resolve(null));
const mockSetSplashScreenState = jest.fn();
let mockOnyxValue: boolean | undefined;
const mockUseOnyx = jest.fn(() => [mockOnyxValue, {status: 'loaded'}]);

jest.mock('@hooks/useOnyx', () => () => mockUseOnyx());
jest.mock('@libs/actions/HybridApp', () => ({
    getHybridAppSettings: () => mockGetHybridAppSettings(),
}));
jest.mock('@libs/actions/Session', () => ({
    setupNewDotAfterTransitionFromOldDot: jest.fn(() => Promise.resolve()),
}));
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn()},
}));
jest.mock('@libs/telemetry/activeSpans', () => ({
    endSpan: jest.fn(),
    startSpan: jest.fn(),
}));
jest.mock('@libs/telemetry/bootsplashTelemetry', () => ({
    addBootsplashBreadcrumb: jest.fn(),
}));
jest.mock('@libs/telemetry/databaseSizeTracker', () => ({
    scheduleInitialDatabaseSizeMeasurement: jest.fn(),
}));
jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {IS_HYBRID_APP: true},
}));
jest.mock('@src/SplashScreenStateContext', () => ({
    useSplashScreenActions: () => ({setSplashScreenState: mockSetSplashScreenState}),
}));

describe('HybridAppHandler', () => {
    beforeEach(() => {
        mockOnyxValue = undefined;
        jest.clearAllMocks();
    });

    it('restores the hidden splash state after a JavaScript reload', async () => {
        render(<HybridAppHandler />);

        await waitFor(() => {
            expect(mockGetHybridAppSettings).toHaveBeenCalledTimes(1);
            expect(mockSetSplashScreenState).toHaveBeenCalledWith(CONST.BOOT_SPLASH_STATE.HIDDEN);
        });
    });

    it('requests native settings only once when Onyx dependencies change in the same JavaScript runtime', async () => {
        mockGetHybridAppSettings.mockResolvedValueOnce({hybridApp: {}});
        const {rerender} = render(<HybridAppHandler />);
        await waitFor(() => expect(mockSetSplashScreenState).toHaveBeenCalledWith(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN));

        mockOnyxValue = true;
        rerender(<HybridAppHandler />);

        await waitFor(() => expect(mockUseOnyx).toHaveBeenCalledTimes(4));
        expect(mockGetHybridAppSettings).toHaveBeenCalledTimes(1);
        expect(mockSetSplashScreenState).not.toHaveBeenCalledWith(CONST.BOOT_SPLASH_STATE.HIDDEN);
    });
});
