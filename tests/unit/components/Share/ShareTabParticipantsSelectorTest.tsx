import {render} from '@testing-library/react-native';

import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';

import type MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ComponentProps} from 'react';

import React from 'react';

type CapturedSelectorProps = Pick<ComponentProps<typeof MoneyRequestParticipantsSelector>, 'shouldShowContactImportPrompt' | 'shouldDeferTextInputAutoFocus'>;

let lastSelectorProps: CapturedSelectorProps | undefined;
jest.mock('@pages/iou/request/MoneyRequestParticipantsSelector', () => {
    function MockMoneyRequestParticipantsSelector({shouldShowContactImportPrompt, shouldDeferTextInputAutoFocus}: CapturedSelectorProps) {
        lastSelectorProps = {shouldShowContactImportPrompt, shouldDeferTextInputAutoFocus};
        return null;
    }
    MockMoneyRequestParticipantsSelector.displayName = 'MoneyRequestParticipantsSelector';
    return MockMoneyRequestParticipantsSelector;
});

// Onyx values by key; each test sets the ones it needs before rendering.
const mockOnyxValues: Record<string, unknown> = {};
jest.mock('@hooks/useOnyx', () => (key: string) => [mockOnyxValues[key], {status: 'loaded'}]);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/usePreferredPolicy', () => () => ({isRestrictedToPreferredPolicy: false, preferredPolicyID: undefined}));
jest.mock('@libs/telemetry/activeSpans', () => ({cancelSpan: jest.fn(), getSpan: jest.fn(), startSpan: jest.fn()}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({clearMoneyRequest: jest.fn()}));
jest.mock('@libs/actions/Share', () => ({saveUnknownUserDetails: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), getActiveRoute: jest.fn(() => '')}));
jest.mock('@libs/ReportUtils', () => ({getPolicyExpenseChat: jest.fn()}));
jest.mock('@userActions/Report', () => ({getOptimisticChatReport: jest.fn(), saveReportDraft: jest.fn()}));

const sharedHeic = {id: 'shared.heic', content: 'file:///sharedFiles/shared.heic', mimeType: CONST.SHARE_FILE_MIMETYPE.HEIC};
const sharedJpeg = {id: 'shared.jpeg', content: 'file:///sharedFiles/shared.jpeg', mimeType: CONST.SHARE_FILE_MIMETYPE.JPEG};

function renderSelector() {
    return render(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);
}

describe('ShareTabParticipantsSelector', () => {
    beforeEach(() => {
        lastSelectorProps = undefined;
        for (const key of Object.keys(mockOnyxValues)) {
            delete mockOnyxValues[key];
        }
    });

    it.each([
        ['Submit', ROUTES.SHARE_SUBMIT_DETAILS],
        ['Share', ROUTES.SHARE_DETAILS],
    ])('does not show the import contacts prompt in the %s tab', (_tabName, detailsPageRouteObject) => {
        // Given the share flow is open on this tab
        // When its participant picker renders
        render(<ShareTabParticipantsSelector detailsPageRouteObject={detailsPageRouteObject} />);

        // Then it turns the prompt off, so it can't open over the share flow's file error bottom sheet
        expect(lastSelectorProps?.shouldShowContactImportPrompt).toBe(false);
    });

    it('waits to focus the search input until the shared file is known', () => {
        // Given the shared file hasn't been read yet
        // When the picker renders
        renderSelector();

        // Then the keyboard stays closed for now, because the file may still need checking
        expect(lastSelectorProps?.shouldDeferTextInputAutoFocus).toBe(true);
    });

    it('focuses the search input right away for a shared file that needs no checking', () => {
        // Given a shared JPEG, which skips the HEIC/image check
        mockOnyxValues[ONYXKEYS.SHARE_TEMP_FILE] = sharedJpeg;

        // When the picker renders
        renderSelector();

        // Then the search input can focus right away
        expect(lastSelectorProps?.shouldDeferTextInputAutoFocus).toBe(false);
    });

    it('keeps the keyboard closed while a shared HEIC is checked, and opens it only once the file has passed', () => {
        // Given a shared HEIC that is still being converted, or failed and is showing the error bottom sheet
        mockOnyxValues[ONYXKEYS.SHARE_TEMP_FILE] = sharedHeic;
        const {rerender} = renderSelector();

        // Then the search input waits, so the keyboard can't open under the error bottom sheet
        expect(lastSelectorProps?.shouldDeferTextInputAutoFocus).toBe(true);

        // When the converted file is saved
        mockOnyxValues[ONYXKEYS.VALIDATED_FILE_OBJECT] = {uri: 'file:///converted.jpg', name: 'shared.jpg', type: 'image/jpeg'};
        rerender(<ShareTabParticipantsSelector detailsPageRouteObject={ROUTES.SHARE_SUBMIT_DETAILS} />);

        // Then the search input may focus
        expect(lastSelectorProps?.shouldDeferTextInputAutoFocus).toBe(false);
    });
});
