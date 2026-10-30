import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';

import Navigation from '@libs/Navigation/Navigation';

import DynamicIOURequestStepUpgrade from '@pages/iou/request/step/DynamicIOURequestStepUpgrade';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {signInWithTestUser} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: jest.fn()}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({navigate: jest.fn(), addListener: jest.fn(() => jest.fn())})),
    useIsFocused: jest.fn(() => true),
    useFocusEffect: jest.fn(),
    useRoute: jest.fn(() => ({key: '', name: '', params: {}})),
    usePreventRemove: jest.fn(),
}));

jest.mock('@src/libs/actions/Policy/Policy', () => ({
    ...jest.requireActual<Record<string, unknown>>('@src/libs/actions/Policy/Policy'),
    createWorkspace: jest.fn(() => ({policyID: 'newPolicyID', policyName: 'Workspace'})),
}));

// Each step of the upgrade is reduced to the one button that moves it forward.
function mockStepButton(label: string, onPress: () => void) {
    const {Pressable, Text} = jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void; role?: string}>>>('react-native');
    return (
        <Pressable
            role="button"
            onPress={onPress}
        >
            <Text>{label}</Text>
        </Pressable>
    );
}
jest.mock(
    '@pages/workspace/upgrade/UpgradeIntro',
    () =>
        ({onUpgrade}: {onUpgrade: () => void}) =>
            mockStepButton('upgrade', onUpgrade),
);
jest.mock(
    '@components/WorkspaceConfirmationForm',
    () =>
        ({onSubmit}: {onSubmit: (params: WorkspaceConfirmationSubmitFunctionParams) => void}) =>
            mockStepButton('confirm', () => onSubmit({name: 'Workspace', currency: 'USD', makeMeAdmin: false, avatarFile: undefined, policyID: 'newPolicyID'})),
);
jest.mock(
    '@pages/workspace/upgrade/UpgradeConfirmation',
    () =>
        ({afterUpgradeAcknowledged}: {afterUpgradeAcknowledged: () => void}) =>
            mockStepButton('gotIt', afterUpgradeAcknowledged),
);

const TRANSACTION_ID = 'transaction-1';
const REPORT_ID = 'report-1';

const renderUpgradeStep = (shouldReturnToConfirmation: boolean) =>
    render(
        <OnyxListItemProvider>
            <CurrentUserPersonalDetailsProvider>
                <LocaleContextProvider>
                    <CurrencyListContextProvider>
                        <DynamicIOURequestStepUpgrade
                            route={{
                                key: 'DynamicIOURequestStepUpgrade',
                                name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_UPGRADE,
                                params: {
                                    action: CONST.IOU.ACTION.CREATE,
                                    iouType: CONST.IOU.TYPE.TRACK,
                                    transactionID: TRANSACTION_ID,
                                    reportID: REPORT_ID,
                                    upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                                    shouldReturnToConfirmation,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here
                            navigation={undefined}
                        />
                    </CurrencyListContextProvider>
                </LocaleContextProvider>
            </CurrentUserPersonalDetailsProvider>
        </OnyxListItemProvider>,
    );

const upgradeAndAcknowledge = async () => {
    fireEvent.press(screen.getByText('upgrade'));
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText('confirm'));
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText('gotIt'));
    await waitForBatchedUpdatesWithAct();
};

describe('DynamicIOURequestStepUpgrade', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await signInWithTestUser(1, 'test@user.com');
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('only goes back to the confirmation form after a category upgrade that asked to return there', async () => {
        // Given the category upgrade, opened from a confirmation form that opens its own category list
        renderUpgradeStep(true);

        // When the user upgrades and acknowledges it
        await upgradeAndAcknowledge();

        // Then the upgrade screen closes without pushing the full-page Category step, so the form can open its list in place
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.setNavigationActionToMicrotaskQueue).not.toHaveBeenCalled();
    });

    it('opens the full-page Category step after a category upgrade that did not ask to return', async () => {
        // Given the category upgrade, opened from a place that relies on the full-page Category step
        renderUpgradeStep(false);

        // When the user upgrades and acknowledges it
        await upgradeAndAcknowledge();

        // Then the upgrade screen closes and the Category step opens, as before
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });
});
