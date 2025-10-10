import {render} from '@testing-library/react-native';
import React from 'react';
import useAutoUpdateTimezone from '@hooks/useAutoUpdateTimezone';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
// eslint-disable-next-line no-restricted-syntax
import * as PersonalDetails from '@userActions/PersonalDetails';

jest.mock('@hooks/useCurrentUserPersonalDetails');

describe('useAutoUpdateTimezone', () => {
    const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.MockedFunction<typeof useCurrentUserPersonalDetails>;
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
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: 1,
            timezone: {
                automatic: true,
                selected: 'Europe/Warsaw',
            },
        } as unknown as ReturnType<typeof useCurrentUserPersonalDetails>);

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).toHaveBeenCalledWith(
            {
                automatic: true,
                selected: 'America/Los_Angeles',
            },
            1,
        );
    });

    it('does not call update when selected matches system timezone', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: 1,
            timezone: {
                automatic: true,
                selected: 'America/New_York',
            },
        } as unknown as ReturnType<typeof useCurrentUserPersonalDetails>);

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).not.toHaveBeenCalled();
    });

    it('does not call update when automatic is false', () => {
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: 1,
            timezone: {
                automatic: false,
                selected: 'America/Los_Angeles',
            },
        } as unknown as ReturnType<typeof useCurrentUserPersonalDetails>);

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).not.toHaveBeenCalled();
    });

    it('does not call update when system timezone is invalid', () => {
        setSystemTimezone('');
        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: 1,
            timezone: {
                automatic: true,
                selected: 'America/Los_Angeles',
            },
        } as unknown as ReturnType<typeof useCurrentUserPersonalDetails>);

        render(<TestComponent />);

        expect(updateAutomaticTimezoneSpy).not.toHaveBeenCalled();
    });
});
