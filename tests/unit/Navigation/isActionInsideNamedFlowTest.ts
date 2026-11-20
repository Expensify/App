import isActionInsideNamedFlow from '@libs/Navigation/helpers/isActionInsideNamedFlow';

import SCREENS from '@src/SCREENS';

import {CommonActions, StackActions} from '@react-navigation/native';

const PRIVATE_FLOW = [SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS, SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE];
const BANK_FLOW = [SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT];

describe('Settings and bank flow boundaries', () => {
    it.each(PRIVATE_FLOW)('permits an internal private-details replacement: %s', (name) => {
        // Given Settings contains the editor and verification
        const action = {...StackActions.replace(name), target: 'settings'};
        // When one member replaces the other
        const inside = isActionInsideNamedFlow(action, PRIVATE_FLOW, 'settings');
        // Then the handoff is not abandonment
        expect(inside).toBe(true);
    });

    it('does not exempt an unrelated replacement just because it targets Settings', () => {
        // Given Wallet is another screen in the same navigator
        const action = {...StackActions.replace(SCREENS.SETTINGS.WALLET.ROOT), target: 'settings'};
        // When it replaces the pending operation
        const inside = isActionInsideNamedFlow(action, PRIVATE_FLOW, 'settings');
        // Then confirmation is still required
        expect(inside).toBe(false);
    });

    it('does not exempt a replacement in another navigator', () => {
        // Given the destination belongs to another stack
        const action = {...StackActions.replace(PRIVATE_FLOW[0]), target: 'other'};
        // When its name happens to match a flow member
        const inside = isActionInsideNamedFlow(action, PRIVATE_FLOW, 'settings');
        // Then it is not an internal handoff
        expect(inside).toBe(false);
    });

    it.each([{screenNames: PRIVATE_FLOW}, {screenNames: BANK_FLOW}])('recognizes reconstructed operation routes: %p', ({screenNames}) => {
        // Given history reconstructs route keys but retains the operation
        const action = CommonActions.reset({routes: [{name: 'RHP', state: {routes: [{name: screenNames[0]}]}}]});
        // When the owner observes its old key being removed
        const inside = isActionInsideNamedFlow(action, screenNames);
        // Then retained work does not prompt
        expect(inside).toBe(true);
    });

    it.each([{screenNames: PRIVATE_FLOW}, {screenNames: BANK_FLOW}])('detects full abandonment on browser back: %p', ({screenNames}) => {
        // Given the browser destination no longer contains this operation
        const action = CommonActions.reset({routes: [{name: SCREENS.HOME}]});
        // When navigation removes the entire flow
        const inside = isActionInsideNamedFlow(action, screenNames);
        // Then the discard guard must remain active
        expect(inside).toBe(false);
    });
});
