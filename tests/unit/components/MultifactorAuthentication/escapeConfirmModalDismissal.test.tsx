import {render} from '@testing-library/react-native';

import ReanimatedModal from '@components/Modal/ReanimatedModal';
import type suppressNextEscapeKeyupType from '@components/MultifactorAuthentication/suppressNextEscapeKeyup';

import React from 'react';
import {View} from 'react-native';

// The modal closes on an Escape `keyup` only on web.
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => 'web',
}));

// Jest resolves the native variant by default, so the web variant is loaded by its explicit file name.
const suppressNextEscapeKeyup = jest.requireActual<{default: typeof suppressNextEscapeKeyupType}>('@components/MultifactorAuthentication/suppressNextEscapeKeyup/index.ts').default;

function releaseEscape() {
    document.body.dispatchEvent(new KeyboardEvent('keyup', {key: 'Escape', bubbles: true, cancelable: true}));
}

// The MFA UI suites mock the modal shell, so this pins the real modal's half of the Escape contract:
// the press that opens the cancel confirmation must not close it, and the next press must.
describe('Escape against the real cancel-confirmation modal', () => {
    it('keeps the modal up on the opening release and dismisses it on the next press', () => {
        // Given Escape was held, so its keydown repeated and armed the suppression twice, and the cancel confirmation opened
        const onBackButtonPress = jest.fn();

        suppressNextEscapeKeyup();
        suppressNextEscapeKeyup();
        render(
            <ReanimatedModal
                isVisible
                onBackButtonPress={onBackButtonPress}
                // Required by the props type; `BaseModal` passes the same default.
                swipeThreshold={150}
            >
                <View />
            </ReanimatedModal>,
        );

        // When the user releases the Escape that opened it
        releaseEscape();
        // Then the modal stays up, because closing it on the same press would make the confirmation impossible to see
        expect(onBackButtonPress).not.toHaveBeenCalled();

        // When the user presses Escape again
        releaseEscape();
        // Then the modal is dismissed, because the suppression must swallow only the opening release and not block Escape for good
        expect(onBackButtonPress).toHaveBeenCalledTimes(1);
    });
});
