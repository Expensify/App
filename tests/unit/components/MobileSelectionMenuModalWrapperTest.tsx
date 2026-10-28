import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MobileSelectionMenuModalWrapper from '@components/Modal/Global/MobileSelectionMenuModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

let mockReanimatedModalProps: ReanimatedModalProps | undefined;

// Only the animation layer is replaced, so the test can report the end of the hide animation. Everything above it,
// the "Select" menu item included, is the real tree.
jest.mock('@components/Modal/ReanimatedModal', () => ({
    __esModule: true,
    default: (props: ReanimatedModalProps) => {
        mockReanimatedModalProps = props;
        return props.children;
    },
}));

async function renderWrapper(closeModal: jest.Mock, resolveModal: jest.Mock = jest.fn()) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <MobileSelectionMenuModalWrapper
                closeModal={closeModal}
                resolveModal={resolveModal}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SELECTION_MODE_MENU_ITEM}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
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
});
