import {render} from '@testing-library/react-native';

import type BaseModalComponent from '@components/Modal/BaseModal';
import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';

import type * as ModalActions from '@userActions/Modal';

import CONST from '@src/CONST';

import React from 'react';

describe('BaseModal', () => {
    afterEach(() => {
        jest.resetModules();
    });

    it('passes a non-null initialFocus for a bottom-docked modal when the dismiss-button ref is unmounted', () => {
        // focus-trap throws when `initialFocus` resolves to `null` (vs `false`/`undefined`). For a bottom-docked
        // modal, the dismiss-button ref can be `null` by the time focus-trap reads it (the read is deferred), so
        // the getter must coerce that `null` to `false`. The ReanimatedModal mock is scoped to this test (via
        // jest.doMock) so it doesn't leak into other BaseModal cases.
        let captured: ReanimatedModalProps | undefined;
        jest.doMock('@components/Modal/ReanimatedModal', () => ({
            __esModule: true,
            default: (props: ReanimatedModalProps) => {
                captured = props;
                return null;
            },
        }));
        const {default: BaseModal} = jest.requireActual<{default: typeof BaseModalComponent}>('@components/Modal/BaseModal');

        render(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={jest.fn()}
            >
                {null}
            </BaseModal>,
        );

        const initialFocus = captured?.initialFocus;
        expect(typeof initialFocus).toBe('function');
        if (typeof initialFocus !== 'function') {
            throw new Error('Expected initialFocus to be a function');
        }
        // dismiss button never mounted -> ref.current is null -> the getter resolves to false (no crash)
        expect(initialFocus()).toBe(false);
    });

    it.each([
        [CONST.MODAL.MODAL_TYPE.CENTERED, undefined, false, true],
        [CONST.MODAL.MODAL_TYPE.POPOVER, undefined, true, false],
        [CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED, undefined, true, false],
        [CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED, true, true, true],
    ])('publishes the covering lifecycle for a %s modal with override %s', (type, shouldTreatModalAsCovering, isPopover, isModalCovering) => {
        const willAlertModalBecomeVisible = jest.fn();
        const setModalCovering = jest.fn<void, [number, boolean]>();
        let captured: ReanimatedModalProps | undefined;
        // Keep the component under test on the same React instance as the renderer after jest.resetModules().
        jest.doMock('react', () => React);
        jest.doMock('@userActions/Modal', () => ({
            ...jest.requireActual<typeof ModalActions>('@userActions/Modal'),
            areAllModalsHidden: jest.fn(() => true),
            onModalDidClose: jest.fn(),
            setModalCovering,
            setModalVisibility: jest.fn(),
            willAlertModalBecomeVisible,
        }));
        jest.doMock('@components/Modal/ReanimatedModal', () => ({
            __esModule: true,
            default: (props: ReanimatedModalProps) => {
                captured = props;
                return null;
            },
        }));
        const {default: BaseModal} = jest.requireActual<{default: typeof BaseModalComponent}>('@components/Modal/BaseModal');

        const {unmount} = render(
            <BaseModal
                isVisible
                type={type}
                shouldTreatModalAsCovering={shouldTreatModalAsCovering}
            >
                {null}
            </BaseModal>,
        );

        expect(willAlertModalBecomeVisible).toHaveBeenLastCalledWith(true, isPopover);
        expect(setModalCovering).toHaveBeenLastCalledWith(expect.any(Number), isModalCovering);

        captured?.onModalWillHide?.();
        expect(willAlertModalBecomeVisible).toHaveBeenLastCalledWith(false);
        expect(setModalCovering).toHaveBeenLastCalledWith(expect.any(Number), isModalCovering);

        unmount();
        expect(willAlertModalBecomeVisible).toHaveBeenLastCalledWith(false);
        expect(setModalCovering).toHaveBeenLastCalledWith(expect.any(Number), false);
    });

    it('cleans up when a transient reopen is collapsed into the current close transition', () => {
        const setModalCovering = jest.fn<void, [number, boolean]>();
        const modalProps: ReanimatedModalProps[] = [];
        jest.doMock('react', () => React);
        jest.doMock('@userActions/Modal', () => ({
            ...jest.requireActual<typeof ModalActions>('@userActions/Modal'),
            areAllModalsHidden: jest.fn(() => true),
            onModalDidClose: jest.fn(),
            setModalCovering,
            setModalVisibility: jest.fn(),
            willAlertModalBecomeVisible: jest.fn(),
        }));
        jest.doMock('@components/Modal/ReanimatedModal', () => ({
            __esModule: true,
            default: (props: ReanimatedModalProps) => {
                modalProps.push(props);
                return null;
            },
        }));
        const {default: BaseModal} = jest.requireActual<{default: typeof BaseModalComponent}>('@components/Modal/BaseModal');

        const {rerender, unmount} = render(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        const coveringModalID = setModalCovering.mock.calls.at(0)?.at(0);
        if (coveringModalID === undefined) {
            throw new Error('Expected a covering modal ID');
        }
        modalProps.at(-1)?.onModalWillShow?.();

        rerender(
            <BaseModal
                isVisible={false}
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        const firstCloseProps = modalProps.at(-1);
        firstCloseProps?.onModalWillHide?.();
        rerender(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        rerender(
            <BaseModal
                isVisible={false}
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );

        firstCloseProps?.onModalHide?.();
        expect(setModalCovering).toHaveBeenLastCalledWith(coveringModalID, false);

        unmount();
        expect(setModalCovering).toHaveBeenLastCalledWith(coveringModalID, false);
    });

    it('does not let a stale hide callback clear a later close generation', () => {
        const setModalCovering = jest.fn<void, [number, boolean]>();
        const modalProps: ReanimatedModalProps[] = [];
        jest.doMock('react', () => React);
        jest.doMock('@userActions/Modal', () => ({
            ...jest.requireActual<typeof ModalActions>('@userActions/Modal'),
            areAllModalsHidden: jest.fn(() => true),
            onModalDidClose: jest.fn(),
            setModalCovering,
            setModalVisibility: jest.fn(),
            willAlertModalBecomeVisible: jest.fn(),
        }));
        jest.doMock('@components/Modal/ReanimatedModal', () => ({
            __esModule: true,
            default: (props: ReanimatedModalProps) => {
                modalProps.push(props);
                return null;
            },
        }));
        const {default: BaseModal} = jest.requireActual<{default: typeof BaseModalComponent}>('@components/Modal/BaseModal');

        const {rerender, unmount} = render(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        const coveringModalID = setModalCovering.mock.calls.at(0)?.at(0);
        if (coveringModalID === undefined) {
            throw new Error('Expected a covering modal ID');
        }
        modalProps.at(-1)?.onModalWillShow?.();

        rerender(
            <BaseModal
                isVisible={false}
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        const firstCloseProps = modalProps.at(-1);
        firstCloseProps?.onModalWillHide?.();
        rerender(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        modalProps.at(-1)?.onModalWillShow?.();
        rerender(
            <BaseModal
                isVisible={false}
                type={CONST.MODAL.MODAL_TYPE.CENTERED}
            >
                {null}
            </BaseModal>,
        );
        const secondCloseProps = modalProps.at(-1);
        secondCloseProps?.onModalWillHide?.();

        firstCloseProps?.onModalHide?.();
        expect(setModalCovering).toHaveBeenLastCalledWith(coveringModalID, true);

        secondCloseProps?.onModalHide?.();
        expect(setModalCovering).toHaveBeenLastCalledWith(coveringModalID, false);

        unmount();
        expect(setModalCovering).toHaveBeenLastCalledWith(coveringModalID, false);
    });
});
