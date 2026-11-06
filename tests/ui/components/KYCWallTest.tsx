import {act, render} from '@testing-library/react-native';

import AddPaymentMethodMenu from '@components/AddPaymentMethodMenu';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import BaseKYCWall from '@components/KYCWall/BaseKYCWall';
import type {ContinueActionParams, KYCWallProps} from '@components/KYCWall/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as BankAccountActions from '@libs/actions/BankAccounts';
import {openPersonalBankAccountSetupView} from '@libs/actions/BankAccounts';
import type * as WebLocation from '@libs/getClickedTargetLocation/index';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Fund, UserWallet} from '@src/types/onyx';

import type * as WebPlatform from 'react-native-web';

import React from 'react';
import {Dimensions, View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/AddPaymentMethodMenu', () => jest.fn(() => null));
// The web platform alias supplies a real DOM ref below the owning component's placement decisions.
jest.mock('react-native/Libraries/Components/View/View', () => ({
    __esModule: true,
    default: jest.requireActual<typeof WebPlatform.View>('react-native-web/dist/cjs/exports/View/index.js'),
}));
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/getClickedTargetLocation', () => jest.requireActual<typeof WebLocation>('@libs/getClickedTargetLocation/index.ts'));
jest.mock('@libs/actions/BankAccounts', () => ({
    openPersonalBankAccountSetupView: jest.fn<
        ReturnType<typeof BankAccountActions.openPersonalBankAccountSetupView>,
        Parameters<typeof BankAccountActions.openPersonalBankAccountSetupView>
    >(),
    setPersonalBankAccountContinueKYCOnSuccess: jest.fn<
        ReturnType<typeof BankAccountActions.setPersonalBankAccountContinueKYCOnSuccess>,
        Parameters<typeof BankAccountActions.setPersonalBankAccountContinueKYCOnSuccess>
    >(),
}));

let continueAction: ((params?: ContinueActionParams) => void) | undefined;
const childWithAnchor: KYCWallProps['children'] = (continueKYC, anchorRef) => {
    continueAction = continueKYC;
    return <View ref={anchorRef} />;
};
const childWithoutAnchor: KYCWallProps['children'] = (continueKYC) => {
    continueAction = continueKYC;
    return null;
};

describe('BaseKYCWall actual placement and continuation', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));
    beforeEach(async () => {
        jest.clearAllMocks();
        continueAction = undefined;
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {});
        await waitForBatchedUpdatesWithAct();
    });
    afterEach(() => jest.restoreAllMocks());

    it.each([CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM])('prefers the anchor and preserves %s alignment offsets', async (vertical) => {
        // Given distinct anchor and event rectangles, with a receiver-sensitive web element producer.
        const anchor = document.createElement('div');
        const eventTarget = document.createElement('button');
        jest.spyOn(anchor, 'getBoundingClientRect').mockImplementation(function getBoundingClientRect(this: HTMLDivElement) {
            expect(this).toBe(anchor);
            return createMock<ReturnType<Element['getBoundingClientRect']>>({x: 10, y: 20, top: 20, bottom: 60, left: 10, right: 40, width: 30, height: 40});
        });
        const eventRectangle = jest
            .spyOn(eventTarget, 'getBoundingClientRect')
            .mockReturnValue(createMock<ReturnType<Element['getBoundingClientRect']>>({x: 100, y: 200, top: 200, bottom: 600, left: 100, right: 400, width: 300, height: 400}));
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <BaseKYCWall
                    enablePaymentsRoute={ROUTES.HOME}
                    onSuccessfulKYC={jest.fn()}
                    anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical}}
                    ref={null}
                >
                    {childWithAnchor}
                </BaseKYCWall>
            </ComposeProviders>,
            {createNodeMock: () => anchor},
        );
        await waitForBatchedUpdatesWithAct();
        expect(continueAction).toBeDefined();
        const attachedAnchor = jest.mocked(AddPaymentMethodMenu).mock.calls.at(-1)?.[0].anchorRef?.current;
        expect(attachedAnchor?.constructor?.name).toBe('HTMLDivElement');
        expect(attachedAnchor === anchor).toBe(true);
        // When the real continuation branch opens the menu using the actual web location implementation.
        act(() => continueAction?.({event: createMock<KeyboardEvent>({currentTarget: eventTarget})}));
        // Then anchor precedence, alignment offsets and receiver identity remain intact.
        const menu = jest.mocked(AddPaymentMethodMenu).mock.calls.at(-1)?.[0];
        expect(menu).toBeDefined();
        expect(menu?.isVisible).toBe(true);
        expect(menu?.anchorPosition).toEqual({
            vertical: vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP ? 60 + CONST.MODAL.POPOVER_MENU_PADDING : 20 - CONST.MODAL.POPOVER_MENU_PADDING,
            horizontal: vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP ? 30 : 10,
        });
        expect(eventRectangle).not.toHaveBeenCalled();
    });

    it('uses the event fallback, saves it for resize, and toggles the menu closed', async () => {
        // Given no attached anchor and an event target whose position changes between continuation and resize.
        const target = document.createElement('button');
        jest.spyOn(target, 'getBoundingClientRect')
            .mockReturnValueOnce(createMock<ReturnType<Element['getBoundingClientRect']>>({x: 5, y: 15, top: 15, bottom: 45, left: 5, right: 25, width: 20, height: 30}))
            .mockReturnValue(createMock<ReturnType<Element['getBoundingClientRect']>>({x: 25, y: 35, top: 35, bottom: 65, left: 25, right: 45, width: 20, height: 30}));
        const listener = jest.spyOn(Dimensions, 'addEventListener');
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <BaseKYCWall
                    enablePaymentsRoute={ROUTES.HOME}
                    onSuccessfulKYC={jest.fn()}
                    shouldListenForResize
                    ref={null}
                >
                    {childWithoutAnchor}
                </BaseKYCWall>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(continueAction).toBeDefined();
        // When continuation opens the menu and the production Dimensions listener recalculates its saved target.
        act(() => continueAction?.({event: createMock<KeyboardEvent>({currentTarget: target})}));
        const resize = listener.mock.calls.at(-1)?.[1];
        expect(resize).toBeDefined();
        act(() => resize?.({window: {width: 100, height: 100, scale: 1, fontScale: 1}, screen: {width: 100, height: 100, scale: 1, fontScale: 1}}));
        const resized = jest.mocked(AddPaymentMethodMenu).mock.calls.at(-1)?.[0];
        // Then resize reuses the event target rather than an unrelated event, and another continuation closes the menu.
        expect(resized).toBeDefined();
        expect(resized?.anchorPosition).toEqual({vertical: 35 - CONST.MODAL.POPOVER_MENU_PADDING, horizontal: 25});
        act(() => continueAction?.());
        expect(jest.mocked(AddPaymentMethodMenu).mock.calls.at(-1)?.[0].isVisible).toBe(false);
    });

    it('carries the pending personal-bank-account fallback through a real menu selection', async () => {
        // Given a payment menu with a continuation route owned by the calling flow.
        const target = document.createElement('button');
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <BaseKYCWall
                    enablePaymentsRoute={ROUTES.HOME}
                    onSuccessfulKYC={jest.fn()}
                    ref={null}
                >
                    {childWithoutAnchor}
                </BaseKYCWall>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(continueAction).toBeDefined();
        // When continuation saves the fallback and the real menu callback chooses a personal bank account.
        act(() => continueAction?.({event: createMock<KeyboardEvent>({currentTarget: target}), personalBankAccountOnSuccessFallbackRoute: ROUTES.INBOX}));
        const menu = jest.mocked(AddPaymentMethodMenu).mock.calls.at(-1)?.[0];
        expect(menu).toBeDefined();
        act(() => menu?.onItemSelected(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT));
        // Then the bank-account action receives the same route after placement and menu selection.
        expect(openPersonalBankAccountSetupView).toHaveBeenCalledWith({shouldSetUpUSBankAccount: false, onSuccessFallbackRoute: ROUTES.INBOX});
    });

    it.each([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM])('continues once with the original payment and source for an activated %s wallet', async (tierName) => {
        // Given a real personal debit-card model and an activated wallet in Onyx.
        const debitCard = {accountData: {fundID: 1, additionalData: {isP2PDebitCard: true}}} satisfies Fund;
        await Onyx.set(ONYXKEYS.FUND_LIST, {[debitCard.accountData.fundID]: debitCard});
        await Onyx.set(ONYXKEYS.USER_WALLET, createMock<UserWallet>({tierName}));
        const onSuccessfulKYC = jest.fn<ReturnType<KYCWallProps['onSuccessfulKYC']>, Parameters<KYCWallProps['onSuccessfulKYC']>>();
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <BaseKYCWall
                    enablePaymentsRoute={ROUTES.HOME}
                    onSuccessfulKYC={onSuccessfulKYC}
                    source={CONST.KYC_WALL_SOURCE.REPORT}
                    ref={null}
                >
                    {childWithoutAnchor}
                </BaseKYCWall>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(continueAction).toBeDefined();
        // When an eligible personal payment passes the actual wallet and payment-method checks.
        act(() => continueAction?.({iouPaymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY}));
        // Then continuation retains both arguments and needs no menu placement or navigation.
        expect(onSuccessfulKYC).toHaveBeenCalledTimes(1);
        expect(onSuccessfulKYC).toHaveBeenCalledWith(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, CONST.KYC_WALL_SOURCE.REPORT);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(jest.mocked(AddPaymentMethodMenu).mock.calls.at(-1)?.[0].isVisible).toBe(false);
    });

    it.each([undefined, ROUTES.HOME])('requires wallet activation and respects the existing return route %s', async (goBackRoute) => {
        // Given a valid debit card but a wallet that still requires KYC activation.
        const debitCard = {accountData: {fundID: 1, additionalData: {isP2PDebitCard: true}}} satisfies Fund;
        await Onyx.set(ONYXKEYS.FUND_LIST, {[debitCard.accountData.fundID]: debitCard});
        await Onyx.set(ONYXKEYS.USER_WALLET, createMock<UserWallet>({tierName: CONST.WALLET.TIER_NAME.SILVER}));
        const onSuccessfulKYC = jest.fn<ReturnType<KYCWallProps['onSuccessfulKYC']>, Parameters<KYCWallProps['onSuccessfulKYC']>>();
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentUserPersonalDetailsProvider]}>
                <BaseKYCWall
                    enablePaymentsRoute={ROUTES.HOME}
                    onSuccessfulKYC={onSuccessfulKYC}
                    ref={null}
                >
                    {childWithoutAnchor}
                </BaseKYCWall>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        expect(continueAction).toBeDefined();
        // When the actual continuation branch evaluates the wallet tier and its return route.
        act(() => continueAction?.({goBackRoute}));
        // Then it requests activation only when another route must be opened, without completing KYC.
        expect(onSuccessfulKYC).not.toHaveBeenCalled();
        if (goBackRoute === ROUTES.HOME) {
            expect(Navigation.navigate).not.toHaveBeenCalled();
            return;
        }
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.HOME);
    });
});
