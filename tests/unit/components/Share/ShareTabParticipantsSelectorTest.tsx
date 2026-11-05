import {render} from '@testing-library/react-native';

import ShareTabParticipantsSelector from '@components/Share/ShareTabParticipantsSelector';

import type MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';

import ROUTES from '@src/ROUTES';

import type {ComponentProps} from 'react';

import React from 'react';

type CapturedSelectorProps = Pick<ComponentProps<typeof MoneyRequestParticipantsSelector>, 'shouldShowContactImportPrompt'>;

let lastSelectorProps: CapturedSelectorProps | undefined;
jest.mock('@pages/iou/request/MoneyRequestParticipantsSelector', () => {
    function MockMoneyRequestParticipantsSelector({shouldShowContactImportPrompt}: CapturedSelectorProps) {
        lastSelectorProps = {shouldShowContactImportPrompt};
        return null;
    }
    MockMoneyRequestParticipantsSelector.displayName = 'MoneyRequestParticipantsSelector';
    return MockMoneyRequestParticipantsSelector;
});

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useOnyx', () => () => [undefined, {status: 'loaded'}]);
jest.mock('@hooks/usePreferredPolicy', () => () => ({isRestrictedToPreferredPolicy: false, preferredPolicyID: undefined}));
jest.mock('@libs/telemetry/activeSpans', () => ({cancelSpan: jest.fn(), getSpan: jest.fn(), startSpan: jest.fn()}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({clearMoneyRequest: jest.fn()}));
jest.mock('@libs/actions/Share', () => ({saveUnknownUserDetails: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), getActiveRoute: jest.fn(() => '')}));
jest.mock('@libs/ReportUtils', () => ({getPolicyExpenseChat: jest.fn()}));
jest.mock('@userActions/Report', () => ({getOptimisticChatReport: jest.fn(), saveReportDraft: jest.fn()}));

describe('ShareTabParticipantsSelector', () => {
    beforeEach(() => {
        lastSelectorProps = undefined;
    });

    it.each([
        ['Submit', ROUTES.SHARE_SUBMIT_DETAILS],
        ['Share', ROUTES.SHARE_DETAILS],
    ])('does not show the import contacts prompt in the %s tab', (_tabName, detailsPageRouteObject) => {
        // When the share flow's participant picker renders
        render(<ShareTabParticipantsSelector detailsPageRouteObject={detailsPageRouteObject} />);

        // Then it turns the prompt off, so it can't open over the share flow's file error bottom sheet
        expect(lastSelectorProps?.shouldShowContactImportPrompt).toBe(false);
    });
});
