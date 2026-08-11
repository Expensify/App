import {render} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import VerifyAccountPage from '@pages/Travel/VerifyAccountPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

jest.mock('@hooks/useOnyx');
jest.mock('@hooks/usePermissions');
jest.mock('@pages/settings/VerifyAccountPageBase', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

const POLICY_ID = 'testPolicy123';
const BACK_TO = ROUTES.TRAVEL_MY_TRIPS.getRoute(POLICY_ID);
const mockedUseOnyx = jest.mocked(useOnyx);
const mockedUsePermissions = jest.mocked(usePermissions);
const mockedVerifyAccountPageBase = jest.mocked(VerifyAccountPageBase);

function renderVerifyAccountPage(shouldResumeBooking?: string) {
    const route = {
        key: 'Travel_VerifyAccount-test',
        name: SCREENS.TRAVEL.VERIFY_ACCOUNT,
        params: {policyID: POLICY_ID, backTo: BACK_TO, shouldResumeBooking},
    } as never;

    return render(
        <VerifyAccountPage
            route={route}
            navigation={{} as never}
        />,
    );
}

describe('Travel VerifyAccountPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseOnyx.mockReturnValue([undefined] as never);
        mockedUsePermissions.mockReturnValue({isBetaEnabled: (beta) => beta === CONST.BETAS.IS_TRAVEL_VERIFIED} as never);
    });

    it('continues an admin verification into Travel enablement', () => {
        renderVerifyAccountPage();

        expect(mockedVerifyAccountPageBase).toHaveBeenCalledWith(
            expect.objectContaining({
                navigateForwardTo: ROUTES.TRAVEL_ENABLE.getRoute(POLICY_ID),
                handleClose: undefined,
            }),
            undefined,
        );
    });

    it('returns a non-admin booking verification to its originating screen', () => {
        renderVerifyAccountPage('true');

        expect(mockedVerifyAccountPageBase).toHaveBeenCalledWith(
            expect.objectContaining({
                navigateBackTo: BACK_TO,
                navigateForwardTo: undefined,
                handleClose: expect.any(Function),
                onValidationSuccess: undefined,
            }),
            undefined,
        );
    });
});
