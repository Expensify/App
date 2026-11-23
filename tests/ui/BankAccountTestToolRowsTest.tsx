import {render, screen} from '@testing-library/react-native';

import BankAccountTestToolRows from '@components/BankAccountTestToolRows';
import EnvironmentProvider from '@components/EnvironmentContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import getEnvironment from '@libs/Environment/getEnvironment';

import {setActiveServer} from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/CONFIG', () => {
    const actualConfig = jest.requireActual<{default: {EXPENSIFY: Record<string, unknown>}}>('@src/CONFIG').default;
    return {
        __esModule: true,
        default: {...actualConfig, EXPENSIFY: {...actualConfig.EXPENSIFY, QA_API_ROOT: 'https://qa.example.com/'}},
    };
});

jest.mock('@libs/Environment/getEnvironment', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve('development')),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn(), dismissModal: jest.fn(), getActiveRoute: jest.fn(() => ''), getActiveRouteWithoutParams: jest.fn(() => '')},
}));

const isUsingLocalWebConfig = jest.replaceProperty(CONFIG, 'IS_USING_LOCAL_WEB', false);

type RenderOptions = {
    environment: ValueOf<typeof CONST.ENVIRONMENT>;
    isUsingLocalWeb: boolean;
    server?: ValueOf<typeof CONST.SERVER>;
    email: string;
};

async function renderRows({environment, isUsingLocalWeb, server, email}: RenderOptions) {
    jest.mocked(getEnvironment).mockResolvedValue(environment);
    isUsingLocalWebConfig.replaceValue(isUsingLocalWeb);
    await Onyx.set(ONYXKEYS.SESSION, {email});
    if (server) {
        setActiveServer(server);
    }

    render(
        <OnyxListItemProvider>
            <EnvironmentProvider>
                <LocaleContextProvider>
                    <BankAccountTestToolRows />
                </LocaleContextProvider>
            </EnvironmentProvider>
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

function expectRowsShown(isShown: boolean) {
    const rows = [
        screen.queryByText(translateLocal('initialSettingsPage.troubleshoot.testBusinessBankAccount')),
        screen.queryByText(translateLocal('initialSettingsPage.troubleshoot.testPersonalBankAccount')),
    ];
    expect(rows.map((row) => !!row)).toEqual([isShown, isShown]);
}

describe('BankAccountTestToolRows', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('shows the rows to any account on a local server', async () => {
        // Given a dev build on a local server
        // When any account opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.DEV, isUsingLocalWeb: true, email: 'contributor@gmail.com'});

        // Then the local server accepts it
        expectRowsShown(true);
    });

    it('hides the rows on a dev build that uses the production server', async () => {
        // Given a dev build with no local server
        // When an internal test account opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.DEV, isUsingLocalWeb: false, email: 'tester@expensifail.com'});

        // Then the production server would refuse it
        expectRowsShown(false);
    });

    it('shows the rows to an internal test account on a dev build that uses the staging server', async () => {
        // Given a dev build switched to the staging server
        // When an internal test account opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.DEV, isUsingLocalWeb: false, server: CONST.SERVER.STAGING, email: 'tester@expensifail.com'});

        // Then the staging server accepts it
        expectRowsShown(true);
    });

    it.each(['contributor@gmail.com', 'tester@applause.expensifail.com'])('hides the rows from %s on the staging server', async (email) => {
        // Given a staging build on the staging server
        // When an account outside the allowed domain opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.STAGING, isUsingLocalWeb: false, email});

        // Then the staging server would refuse it
        expectRowsShown(false);
    });

    it('shows the rows to an internal test account on a staging build', async () => {
        // Given a staging build on its default server
        // When an internal test account opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.STAGING, isUsingLocalWeb: false, email: 'tester@expensifail.com'});

        // Then the staging server accepts it
        expectRowsShown(true);
    });

    it('hides the rows on a staging build switched to the production server', async () => {
        // Given a staging build switched to the production server
        // When an internal test account opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.STAGING, isUsingLocalWeb: false, server: CONST.SERVER.PRODUCTION, email: 'tester@expensifail.com'});

        // Then the production server would refuse it
        expectRowsShown(false);
    });

    it('hides the rows on a local build switched to the QA server', async () => {
        // Given a dev build with a local server, switched to the QA server
        // When any account opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.DEV, isUsingLocalWeb: true, server: CONST.SERVER.QA, email: 'tester@expensifail.com'});

        // Then requests no longer reach the local server
        expectRowsShown(false);
    });

    it('hides the rows on production', async () => {
        // Given a production build with a stored staging server
        // When an internal test account opens the test tools
        await renderRows({environment: CONST.ENVIRONMENT.PRODUCTION, isUsingLocalWeb: false, server: CONST.SERVER.STAGING, email: 'tester@expensifail.com'});

        // Then the rows stay hidden
        expectRowsShown(false);
    });
});
