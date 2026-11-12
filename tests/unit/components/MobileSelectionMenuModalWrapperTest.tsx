import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import Modal from '@components/Modal';
import MobileSelectionMenuModalWrapper from '@components/Modal/Global/MobileSelectionMenuModalWrapper';
import type {MobileSelectionMenuModalWrapperProps} from '@components/Modal/Global/MobileSelectionMenuModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import getPlatform from '@libs/getPlatform';
import {getShouldSuppressBackgroundInputFocus} from '@libs/ModalFocusManager';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

let mockReanimatedModalProps: ReanimatedModalProps | undefined;

jest.mock('@libs/getPlatform', () => ({__esModule: true, default: jest.fn(() => 'web')}));

// Only the animation layer is replaced, so the test can report the end of the hide animation. Everything above it,
// the "Select" menu item included, is the real tree.
jest.mock('@components/Modal/ReanimatedModal', () => ({
    __esModule: true,
    default: (props: ReanimatedModalProps) => {
        mockReanimatedModalProps = props;
        return props.children;
    },
}));

async function renderWrapper(closeModal: jest.Mock, resolveModal: jest.Mock = jest.fn(), options: Partial<MobileSelectionMenuModalWrapperProps> = {}) {
    const result = render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MobileSelectionMenuModalWrapper
                closeModal={closeModal}
                resolveModal={resolveModal}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SELECTION_MODE_MENU_ITEM}
                {...options}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
    return result;
}

async function pressSelect() {
    // The menu item ignores a press that carries no event, so pass one as a real tap would
    fireEvent.press(screen.getByText(translateLocal('common.select')), {nativeEvent: {}});
    await waitForBatchedUpdatesWithAct();
}

function finishHideAnimation() {
    act(() => {
        mockReanimatedModalProps?.onModalHide?.();
    });
}

describe('MobileSelectionMenuModalWrapper', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        mockReanimatedModalProps = undefined;
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
    });

    it('resolves CONFIRM as soon as the user picks "Select", and takes its entry off the stack only after the menu hides', async () => {
        // Given the menu on the global stack
        const closeModal = jest.fn();
        const resolveModal = jest.fn();
        await renderWrapper(closeModal, resolveModal);
        expect(mockReanimatedModalProps?.isVisible).toBe(true);

        // When the user picks "Select"
        await pressSelect();

        // Then the caller is told right away, so selection mode turns on while the menu fades out, but the entry stays on the stack while it animates out
        expect(resolveModal).toHaveBeenCalledTimes(1);
        expect(resolveModal).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
        expect(mockReanimatedModalProps?.isVisible).toBe(false);
        expect(closeModal).not.toHaveBeenCalled();

        // When the hide animation ends
        finishHideAnimation();

        // Then the entry leaves the stack
        expect(closeModal).toHaveBeenCalledTimes(1);
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });

    it('takes its entry off the stack with CLOSE when the user dismisses the menu without picking "Select"', async () => {
        // Given the menu on the global stack
        const closeModal = jest.fn();
        const resolveModal = jest.fn();
        await renderWrapper(closeModal, resolveModal);

        // When the user dismisses it, for example with a backdrop tap, and the hide animation ends
        act(() => {
            mockReanimatedModalProps?.onBackdropPress?.();
        });
        await waitForBatchedUpdatesWithAct();
        expect(mockReanimatedModalProps?.isVisible).toBe(false);
        finishHideAnimation();

        // Then the promise is not settled early, and the entry leaves the stack with CLOSE, so the caller does not enter selection mode
        expect(resolveModal).not.toHaveBeenCalled();
        expect(closeModal).toHaveBeenCalledTimes(1);
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CLOSE});
    });

    it('takes its entry off the stack only once, even if the hide callback fires twice', async () => {
        // Given a menu the user picked "Select" on
        const closeModal = jest.fn();
        await renderWrapper(closeModal);
        await pressSelect();

        // When the hide callback is reported twice
        finishHideAnimation();
        finishHideAnimation();

        // Then the stack is popped once, so a modal underneath is not taken down by the second call
        expect(closeModal).toHaveBeenCalledTimes(1);
    });

    it('does not take its entry off the stack while the menu is still visible', async () => {
        // Given a visible menu
        const closeModal = jest.fn();
        await renderWrapper(closeModal);

        // When a hide callback is reported before the user did anything
        finishHideAnimation();

        // Then the entry stays on the stack, because only a hide the user started should resolve the caller's promise
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('ignores a second Select press while hiding', async () => {
        // Given a confirmed menu that is still animating out, another modal may already be on top.
        const resolveModal = jest.fn();
        await renderWrapper(jest.fn(), resolveModal);
        await pressSelect();

        // When Select receives another press before the animation ends.
        await pressSelect();

        // Then no second modal promise is resolved.
        expect(resolveModal).toHaveBeenCalledTimes(1);
    });

    it('passes the table test ID to Select', async () => {
        // Given a caller that needs its existing selector preserved.
        const resolveModal = jest.fn();
        await renderWrapper(jest.fn(), resolveModal, {testID: CONST.SELECTION_LIST_WITH_MODAL_TEST_ID});

        // When Select is pressed through that selector.
        fireEvent.press(screen.getByTestId(CONST.SELECTION_LIST_WITH_MODAL_TEST_ID), {nativeEvent: {}});

        // Then the same action is confirmed.
        expect(resolveModal).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });

    it('suppresses iOS background focus on Select only when opted in, until the menu hides', async () => {
        // Given an opted-in iOS menu, opening it must not suppress focus yet.
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        await renderWrapper(jest.fn(), jest.fn(), {shouldSkipFocusRestoreOnSelect: true});
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);

        // When the user confirms selection.
        await pressSelect();

        // Then focus restoration is deleted and background focus stays suppressed throughout the hide animation.
        expect(screen.UNSAFE_getByType(Modal).props.restoreFocusType).toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);
        finishHideAnimation();
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
    });

    it.each([
        [CONST.PLATFORM.IOS, false],
        [CONST.PLATFORM.WEB, true],
    ] as const)('preserves default focus behavior on %s with opt-in %s', async (platform, shouldSkipFocusRestoreOnSelect) => {
        // Given Search/report defaults on iOS, or an opted-in table on another platform.
        jest.mocked(getPlatform).mockReturnValue(platform);
        await renderWrapper(jest.fn(), jest.fn(), {shouldSkipFocusRestoreOnSelect});

        // When the user confirms selection.
        await pressSelect();

        // Then neither the restore policy nor background focus suppression changes.
        expect(screen.UNSAFE_getByType(Modal).props.restoreFocusType).not.toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
    });

    it('does not suppress focus when an opted-in iOS menu is dismissed', async () => {
        // Given an opted-in iOS menu.
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        await renderWrapper(jest.fn(), jest.fn(), {shouldSkipFocusRestoreOnSelect: true});

        // When the user dismisses without selecting.
        act(() => mockReanimatedModalProps?.onBackdropPress?.());

        // Then the original focus policy remains in place.
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
        expect(screen.UNSAFE_getByType(Modal).props.restoreFocusType).not.toBe(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
        finishHideAnimation();
    });

    it('releases focus suppression if the wrapper unmounts before hiding', async () => {
        // Given an iOS selection whose hide animation has not finished.
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        const {unmount} = await renderWrapper(jest.fn(), jest.fn(), {shouldSkipFocusRestoreOnSelect: true});
        await pressSelect();
        expect(getShouldSuppressBackgroundInputFocus()).toBe(true);

        // When the stack is torn down before onModalHide.
        unmount();

        // Then background inputs are not left suppressed.
        expect(getShouldSuppressBackgroundInputFocus()).toBe(false);
    });
});
