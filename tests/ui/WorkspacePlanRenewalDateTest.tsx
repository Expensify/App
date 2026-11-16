// cspell:ignore Januar
import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import WorkspacePlanTypePage from '@pages/workspace/DynamicWorkspaceOverviewPlanTypePage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import type {ComponentProps, PropsWithChildren} from 'react';

import {NavigationContext} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {setupGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

setupGlobalFetchMock();

jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/actions/Policy/Plan', () => jest.fn());
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/SelectionList', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);

function renderSurface(children: React.ReactNode) {
    const navigation = createMock<NavigationProp<ParamListBase>>({isFocused: () => true, addListener: () => () => {}});
    return render(
        <NavigationContext.Provider value={navigation}>
            <CurrentUserPersonalDetailsContext.Provider value={{accountID: 999, timezone: {automatic: false, selected: 'Atlantic/Reykjavik'}}}>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>
            </CurrentUserPersonalDetailsContext.Provider>
        </NavigationContext.Provider>,
    );
}

describe('Workspace plan renewal date', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]}));

    beforeEach(async () => {
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
        jest.setSystemTime(new Date('2026-11-03T20:00:00Z'));
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: 999, email: 'date-test@example.com'},
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DE,
                [ONYXKEYS.HAS_LOADED_APP]: true,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}date-test`, createMock<Policy>({id: 'date-test', type: CONST.POLICY.TYPE.CORPORATE, canDowngrade: false}));
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION, {type: CONST.SUBSCRIPTION.TYPE.ANNUAL, endDate: '2027-01-22', userCount: 1});
        });
    });

    afterEach(async () => {
        await act(async () => Onyx.clear());
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('renders a locked annual plan renewal using the localized ordinal-date convention', async () => {
        // Given a read-only annual-plan fixture, without sending a paid plan change
        const props = createMock<ComponentProps<typeof WorkspacePlanTypePage>>({route: {params: {policyID: 'date-test'}}});

        // When the workspace plan page displays the locked subscription's end date
        renderSurface(<WorkspacePlanTypePage {...props} />);
        await waitForBatchedUpdatesWithAct();

        // Then its German description uses a day before the month, not a translated English ordinal pattern
        expect(screen.getByText(/22\. Januar 2027/)).toBeOnTheScreen();
    });
});
