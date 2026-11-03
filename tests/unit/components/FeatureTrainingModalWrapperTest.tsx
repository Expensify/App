import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import FeatureTraining from '@components/FeatureTraining';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import FeatureTrainingModalWrapper from '@components/Modal/Global/FeatureTrainingModalWrapper';
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
// FeatureTrainingModal and its confirm button included, is the real tree.
jest.mock('@components/Modal/ReanimatedModal', () => ({
    __esModule: true,
    default: (props: ReanimatedModalProps) => {
        mockReanimatedModalProps = props;
        return props.children;
    },
}));

// Rendered without a NavigationContainer on purpose: the global modal stack sits above NavigationRoot, so the
// wrapper has to render and confirm without a navigator, as it does in the app
async function renderWrapper({closeModal, shouldCloseOnConfirm}: {closeModal: jest.Mock; shouldCloseOnConfirm?: boolean}) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <FeatureTrainingModalWrapper
                closeModal={closeModal}
                resolveModal={jest.fn()}
                shouldCloseOnConfirm={shouldCloseOnConfirm}
            >
                <FeatureTraining.Body>
                    <FeatureTraining.ConfirmButton>{translateLocal('common.buttonConfirm')}</FeatureTraining.ConfirmButton>
                </FeatureTraining.Body>
            </FeatureTrainingModalWrapper>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

async function pressConfirm() {
    fireEvent.press(screen.getByText(translateLocal('common.buttonConfirm')));
    await waitForBatchedUpdatesWithAct();
}

describe('FeatureTrainingModalWrapper', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        mockReanimatedModalProps = undefined;
    });

    it('takes its entry off the stack only once, even if the user confirms twice', async () => {
        // Given a wrapper on the global stack, outside any navigator, that leaves the stack as soon as the user confirms
        const closeModal = jest.fn();
        await renderWrapper({closeModal, shouldCloseOnConfirm: false});

        // When the user presses the confirm button twice before the stack removes the entry
        await pressConfirm();
        await pressConfirm();

        // Then the stack is popped once, with the confirm, so a modal underneath is not taken down by the second call
        expect(closeModal).toHaveBeenCalledTimes(1);
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });

    it('waits for the modal to hide before taking a confirmed entry off the stack when the modal closes on confirm', async () => {
        // Given a wrapper outside any navigator whose modal animates out on confirm, as feature training modals do by default
        const closeModal = jest.fn();
        await renderWrapper({closeModal});

        // When the user presses the confirm button
        await pressConfirm();

        // Then the modal starts hiding, but the entry stays on the stack while it does
        expect(mockReanimatedModalProps?.isVisible).toBe(false);
        expect(closeModal).not.toHaveBeenCalled();

        // When the hide animation ends
        act(() => {
            mockReanimatedModalProps?.onModalHide?.();
        });

        // Then the entry leaves the stack with the confirm, so the caller knows the user confirmed rather than closed
        expect(closeModal).toHaveBeenCalledTimes(1);
        expect(closeModal).toHaveBeenCalledWith({action: ModalActions.CONFIRM});
    });
});
