import {render} from '@testing-library/react-native';

import BaseParticipantPicker from '@components/ParticipantPicker/BaseParticipantPicker';

import type MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';

import React from 'react';

// The picker's chrome isn't under test here — only which callback reaches the selector's referral banner.
jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    MockScreenWrapper.displayName = 'ScreenWrapper';
    return MockScreenWrapper;
});
jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeaderWithBackButton() {
        return null;
    }
    MockHeaderWithBackButton.displayName = 'HeaderWithBackButton';
    return MockHeaderWithBackButton;
});

type CapturedSelectorProps = Pick<ComponentProps<typeof MoneyRequestParticipantsSelector>, 'onCloseParticipantPicker' | 'onRestrictedParticipantSelected'>;

let lastSelectorProps: CapturedSelectorProps = {};
jest.mock('@pages/iou/request/MoneyRequestParticipantsSelector', () => {
    function MockMoneyRequestParticipantsSelector({onCloseParticipantPicker, onRestrictedParticipantSelected}: CapturedSelectorProps) {
        lastSelectorProps = {onCloseParticipantPicker, onRestrictedParticipantSelected};
        return null;
    }
    MockMoneyRequestParticipantsSelector.displayName = 'MoneyRequestParticipantsSelector';
    return MockMoneyRequestParticipantsSelector;
});

describe('BaseParticipantPicker', () => {
    beforeEach(() => {
        lastSelectorProps = {};
    });

    function renderPicker(onClose: () => void, onCloseForReferralNavigation?: () => void) {
        render(
            <BaseParticipantPicker
                iouType={CONST.IOU.TYPE.CREATE}
                action={CONST.IOU.ACTION.CREATE}
                onParticipantsAdded={jest.fn()}
                onClose={onClose}
                onCloseForReferralNavigation={onCloseForReferralNavigation}
            />,
        );
    }

    it('routes the referral banner through onCloseForReferralNavigation, leaving onClose for real dismissals (#96562)', () => {
        // Given a picker whose owner wants to tell a referral navigation apart from a dismissal
        const onClose = jest.fn();
        const onCloseForReferralNavigation = jest.fn();
        renderPicker(onClose, onCloseForReferralNavigation);

        // When the referral banner closes the picker before navigating
        lastSelectorProps.onCloseParticipantPicker?.();

        // Then only the referral-specific callback fires, so the owner can reopen the picker on the way back
        expect(onCloseForReferralNavigation).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();

        // And a genuine dismissal still goes to onClose, which must not arm the reopen
        lastSelectorProps.onRestrictedParticipantSelected?.();
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onCloseForReferralNavigation).toHaveBeenCalledTimes(1);
    });

    it('falls back to onClose when the owner does not distinguish referral navigation', () => {
        const onClose = jest.fn();
        renderPicker(onClose);

        lastSelectorProps.onCloseParticipantPicker?.();

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
