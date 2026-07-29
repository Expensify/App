import {act, render} from '@testing-library/react-native';

import BaseModal from '@components/Modal/BaseModal';
import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';

import {close} from '@userActions/Modal';

import CONST from '@src/CONST';

import React from 'react';

let mockCapturedProps: ReanimatedModalProps | undefined;

jest.mock('@components/Modal/ReanimatedModal', () => ({
    __esModule: true,
    default: (props: ReanimatedModalProps) => {
        mockCapturedProps = props;
        return null;
    },
}));

describe('BaseModal', () => {
    beforeEach(() => {
        mockCapturedProps = undefined;
    });

    it('passes a non-null initialFocus for a bottom-docked modal when the dismiss-button ref is unmounted', () => {
        // focus-trap throws when `initialFocus` resolves to `null` (vs `false`/`undefined`). For a bottom-docked
        // modal, the dismiss-button ref can be `null` by the time focus-trap reads it (the read is deferred), so
        // the getter must coerce that `null` to `false`.
        render(
            <BaseModal
                isVisible={false}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={jest.fn()}
            >
                {null}
            </BaseModal>,
        );

        const initialFocus = mockCapturedProps?.initialFocus;
        expect(typeof initialFocus).toBe('function');
        if (typeof initialFocus !== 'function') {
            throw new Error('Expected initialFocus to be a function');
        }
        // dismiss button never mounted -> ref.current is null -> the getter resolves to false (no crash)
        expect(initialFocus()).toBe(false);
    });

    it('calls onModalHide before the callback deferred by close', () => {
        const events: string[] = [];

        render(
            <BaseModal
                isVisible
                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                onClose={() => {
                    events.push('close');
                }}
                onModalHide={() => {
                    events.push('modalHide');
                }}
            >
                {null}
            </BaseModal>,
        );

        act(() => {
            close(() => {
                events.push('deferred');
            });
        });
        expect(events).toEqual(['close']);

        act(() => {
            mockCapturedProps?.onModalHide?.();
        });
        expect(events).toEqual(['close', 'modalHide', 'deferred']);
    });
});
