import {render, waitFor} from '@testing-library/react-native';

import CONST from '@src/CONST';
import HybridAppHandler from '@src/HybridAppHandler';

import React from 'react';

const mockGetHybridAppSettings = jest.fn(() => Promise.resolve(null));
const mockSetSplashScreenState = jest.fn();

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
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
    it('restores the hidden splash state after a JavaScript reload', async () => {
        render(<HybridAppHandler />);

        await waitFor(() => {
            expect(mockGetHybridAppSettings).toHaveBeenCalledTimes(1);
            expect(mockSetSplashScreenState).toHaveBeenCalledWith(CONST.BOOT_SPLASH_STATE.HIDDEN);
        });
    });
});
