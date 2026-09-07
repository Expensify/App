/**
 * These tests verify the prompt passed to the confirm modal for:
 *  - selected rows that carry a display name, for both email and phone-number logins
 *  - selected rows without a display name (e.g. right after a cache clear), for both email and phone-number logins
 */
import {act, render} from '@testing-library/react-native';

import {setVacationDelegate} from '@libs/actions/VacationDelegate';

import VacationDelegatePage from '@pages/settings/Profile/CustomStatus/VacationDelegatePage';

import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

import React from 'react';

const mockShowConfirmModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () =>
    jest.fn(() => ({
        showConfirmModal: mockShowConfirmModal,
    })),
);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'me@example.com'})));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        // Echo the param back into the key so tests can assert that the formatted value reached
        // the prompt unchanged.
        translate: (key: string, param?: string) => (param !== undefined ? `${key}(${param})` : key),
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@libs/actions/VacationDelegate', () => ({
    setVacationDelegate: jest.fn(),
    deleteVacationDelegate: jest.fn(),
    clearVacationDelegateError: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

// Capture the `onSelectRow` callback the page passes to the selection component so the test can
// invoke it directly without rendering the full SelectionList tree.
let capturedOnSelectRow: ((option: Participant) => void) | undefined;

jest.mock('@components/BaseVacationDelegateSelectionComponent', () => {
    function MockBaseVacationDelegateSelectionComponent({onSelectRow}: {onSelectRow: (option: Participant) => void}) {
        capturedOnSelectRow = onSelectRow;
        return null;
    }
    return MockBaseVacationDelegateSelectionComponent;
});

const mockSetVacationDelegate = jest.mocked(setVacationDelegate);

const EMAIL_DELEGATE = 'jane@example.com';
const PHONE_DELEGATE_WITH_SMS_DOMAIN = '+919789942470@expensify.sms';
const PHONE_DELEGATE_RAW = '+919789942470';

describe('VacationDelegatePage warning modal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedOnSelectRow = undefined;
        mockShowConfirmModal.mockResolvedValue({action: 'CLOSE'});
        mockSetVacationDelegate.mockResolvedValue({jsonCode: CONST.JSON_CODE.POLICY_DIFF_WARNING});
    });

    async function selectRowAndFlush(login: string, text?: string) {
        render(<VacationDelegatePage />);
        await act(async () => {
            capturedOnSelectRow?.({login, text} as Participant);
        });
    }

    describe('the selected row carries a display name', () => {
        it('uses the display name for an email account in the warning prompt', async () => {
            await selectRowAndFlush(EMAIL_DELEGATE, 'Jane Doe');

            expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: 'statusPage.vacationDelegateWarning(Jane Doe)'}));
        });

        it('strips `@expensify.sms` from the display name for a phone account', async () => {
            await selectRowAndFlush(PHONE_DELEGATE_WITH_SMS_DOMAIN, PHONE_DELEGATE_WITH_SMS_DOMAIN);

            expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: `statusPage.vacationDelegateWarning(${PHONE_DELEGATE_RAW})`}));
            expect(JSON.stringify(mockShowConfirmModal.mock.calls)).not.toContain('@expensify.sms');
        });
    });

    describe('the selected row has no display name (e.g. after cache clear)', () => {
        it('falls back to the email login in the prompt', async () => {
            await selectRowAndFlush(EMAIL_DELEGATE);

            expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: `statusPage.vacationDelegateWarning(${EMAIL_DELEGATE})`}));
        });

        // Bug #89578 — the exact scenario reported.
        it('strips `@expensify.sms` from the phone-number login in the prompt', async () => {
            await selectRowAndFlush(PHONE_DELEGATE_WITH_SMS_DOMAIN);

            expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({prompt: `statusPage.vacationDelegateWarning(${PHONE_DELEGATE_RAW})`}));
            expect(JSON.stringify(mockShowConfirmModal.mock.calls)).not.toContain('@expensify.sms');
        });
    });
});
