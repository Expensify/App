import {render} from '@testing-library/react-native';

import useAutoUpdateTimezone from '@hooks/useAutoUpdateTimezone';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import * as PersonalDetails from '@userActions/PersonalDetails';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@hooks/useCurrentUserPersonalDetails');

describe('useAutoUpdateTimezone', () => {
    const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
    const updateAutomaticTimezoneSpy = jest.spyOn(PersonalDetails, 'updateAutomaticTimezone');

    const originalDateTimeFormat = Intl.DateTimeFormat;

    function setSystemTimezone(tz: string | null) {
        // @ts-expect-error overriding for tests
        Intl.DateTimeFormat = jest.fn().mockReturnValue({
            resolvedOptions: () => ({timeZone: tz}),
        });
    }

    function TestComponent() {
        useAutoUpdateTimezone();
        return null;
    }

    beforeEach(() => {
        jest.clearAllMocks();
        setSystemTimezone('America/New_York');
    });

    afterAll(() => {
        Intl.DateTimeFormat = originalDateTimeFormat;
    });

    it('updates timezone when automatic and mismatch', () => {
        setSystemTimezone('America/Los_Angeles');
        mockUseCurrentUserPersonalDetails.mockReturnValue(
            createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({
                accountID: 1,
                timezone: {
                    automatic: true,
                    selected: 'Europe/Warsaw',
                },
            }),
        );

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).toHaveBeenCalledWith(
            {
                automatic: true,
                selected: 'America/Los_Angeles',
            },
            1,
        );
    });

    it('does not call update when selected timezone matches system timezone (with backwards compatibility)', () => {
        setSystemTimezone('Asia/Calcutta');
        mockUseCurrentUserPersonalDetails.mockReturnValue(
            createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({
                accountID: 1,
                timezone: {
                    automatic: true,
                    selected: 'Asia/Kolkata',
                },
            }),
        );

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).not.toHaveBeenCalled();
    });

    it('does not call update when selected matches system timezone', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue(
            createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({
                accountID: 1,
                timezone: {
                    automatic: true,
                    selected: 'America/New_York',
                },
            }),
        );

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).not.toHaveBeenCalled();
    });

    it('does not call update when automatic is false', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue(
            createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({
                accountID: 1,
                timezone: {
                    automatic: false,
                    selected: 'America/Los_Angeles',
                },
            }),
        );

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).not.toHaveBeenCalled();
    });

    it('does not call update when system timezone is invalid', () => {
        setSystemTimezone('');
        mockUseCurrentUserPersonalDetails.mockReturnValue(
            createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({
                accountID: 1,
                timezone: {
                    automatic: true,
                    selected: 'America/Los_Angeles',
                },
            }),
        );

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).not.toHaveBeenCalled();
    });
});
