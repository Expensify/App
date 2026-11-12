import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import ReportsDefaultTitlePage from '@pages/workspace/reports/ReportsDefaultTitle';

import {setPolicyDefaultReportTitle} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import type ReactNative from 'react-native';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

jest.mock('@userActions/Policy/Policy', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test-only module mock. jest.requireActual returns an untyped module
    const actual = jest.requireActual('@userActions/Policy/Policy');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- test-only module mock. Spreads the real actions and replaces only setPolicyDefaultReportTitle
    return {
        ...actual,
        setPolicyDefaultReportTitle: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const mockSetPolicyDefaultReportTitle = jest.mocked(setPolicyDefaultReportTitle);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (policyID: string) =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.REPORTS_DEFAULT_TITLE}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.REPORTS_DEFAULT_TITLE}
                                component={ReportsDefaultTitlePage}
                                initialParams={{policyID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );

/** The page wrapper needs an admin on a paid workspace. */
const setupPolicy = async (defaultTitle: string) => {
    await TestHelper.signInWithTestUser();
    const policy: Policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
    };
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, {fieldList: {[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]: {defaultValue: defaultTitle}}});
    });
    return policy;
};

const getTitleInput = () => {
    const input = screen.getAllByLabelText(TestHelper.translateLocal('workspace.reports.customNameInputLabel')).find((element) => typeof element.props.value === 'string');
    if (!input) {
        throw new Error('Expected the default report title input');
    }
    return input;
};

/** Waits for the form to be interactive, i.e. past the access wrapper's loading state. */
const waitForForm = async () => {
    await waitForBatchedUpdatesWithAct();
    await waitFor(() => {
        expect(getTitleInput()).toBeOnTheScreen();
    });
};

const save = async () => {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: TestHelper.translateLocal('common.save')}));
    await waitForBatchedUpdatesWithAct();
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

describe('ReportsDefaultTitlePage', () => {
    it('shows a title saved with line breaks on one line', async () => {
        // Given a workspace whose default report title was saved with a line break before the field was single-line
        const policy = await setupPolicy('Expense\nReport {report:id}');
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // Then the input shows the title on one line, since the default report title is a single-line value
        expect(getTitleInput().props.value).toBe('Expense Report {report:id}');

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('saves a pasted multiline title as a single line', async () => {
        // Given the default report title page
        const policy = await setupPolicy('{report:type}');
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When the user pastes a title with line breaks and saves
        fireEvent.changeText(getTitleInput(), '{report:type}\n{report:startdate}\r\n');
        await save();

        // Then the line breaks are squashed to spaces and trimmed, so only a single-line title is saved
        expect(mockSetPolicyDefaultReportTitle).toHaveBeenCalledTimes(1);
        expect(mockSetPolicyDefaultReportTitle.mock.calls.at(0)?.slice(0, 2)).toEqual([policy.id, '{report:type} {report:startdate}']);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('rejects a title made only of line breaks', async () => {
        // Given the default report title page
        const policy = await setupPolicy('{report:type}');
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When the user replaces the title with only line breaks and saves
        fireEvent.changeText(getTitleInput(), '\n\n');
        await save();

        // Then the title counts as empty once line breaks are squashed and trimmed, so it is not saved
        expect(screen.getByText(TestHelper.translateLocal('common.error.fieldRequired'))).toBeOnTheScreen();
        expect(mockSetPolicyDefaultReportTitle).not.toHaveBeenCalled();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
