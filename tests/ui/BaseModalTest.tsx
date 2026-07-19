import {render} from '@testing-library/react-native';

import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';

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
        const BaseModal = (require('@components/Modal/BaseModal') as {default: React.ComponentType<Record<string, unknown>>}).default;

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
        // dismiss button never mounted -> ref.current is null -> the getter resolves to false (no crash)
        expect((initialFocus as () => unknown)()).toBe(false);
    });
});
