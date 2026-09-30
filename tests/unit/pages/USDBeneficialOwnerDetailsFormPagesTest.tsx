import {act, render} from '@testing-library/react-native';

import InteractiveStepWrapper from '@components/InteractiveStepWrapper';

import useReimbursementAccountConfirmationEdit from '@hooks/useReimbursementAccountConfirmationEdit';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import BeneficialOwnerDetailsFormPages from '@pages/ReimbursementAccount/USD/BeneficialOwnerInfo/BeneficialOwnerDetailsFormPages';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ReactElement} from 'react';

jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/InteractiveStepWrapper', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [{beneficialOwnerKeys: []}]));
jest.mock('@hooks/useReimbursementAccountConfirmationEdit', () => jest.fn());
jest.mock('@hooks/useSubPage', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));

const mockCancelEdit = jest.fn();
const mockMoveTo = jest.fn();
const mockMoveToEditPage = jest.fn();
const mockNextPage = jest.fn();
const mockSubmitEdit = jest.fn();

function MockCurrentPage() {
    return null;
}

describe('USD BeneficialOwnerDetailsFormPages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useSubPage).mockReturnValue({
            CurrentPage: MockCurrentPage,
            isEditing: true,
            currentPageName: CONST.BANK_ACCOUNT.BENEFICIAL_OWNERS_STEP.SUB_PAGE_NAMES.LEGAL_NAME,
            pageIndex: 0,
            lastPageIndex: 4,
            prevPage: jest.fn(),
            nextPage: mockNextPage,
            moveTo: mockMoveTo,
            resetToPage: jest.fn(),
            isRedirecting: false,
        });
        jest.mocked(useReimbursementAccountConfirmationEdit).mockReturnValue({
            moveToEditPage: mockMoveToEditPage,
            submitEdit: mockSubmitEdit,
            cancelEdit: mockCancelEdit,
        });
    });

    it('restores the confirmed draft when Back cancels a beneficial-owner edit', () => {
        // Given a Wallet Make payments beneficial-owner field opened from its confirmation page
        render(
            <BeneficialOwnerDetailsFormPages
                policyID="policy-1"
                beneficialOwnerBeingModifiedID="owner-1"
                setBeneficialOwnerBeingModifiedID={jest.fn()}
                isEditingCreatedBeneficialOwner={false}
                onFinished={jest.fn()}
                backTo={ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE}
            />,
        );
        const wrapperProps = jest.mocked(InteractiveStepWrapper).mock.calls.at(-1)?.[0];
        if (!wrapperProps) {
            throw new Error('Expected the beneficial-owner form wrapper to render');
        }
        const currentPage = wrapperProps.children as ReactElement<{onNext: typeof mockSubmitEdit; onMove: typeof mockMoveToEditPage}>;

        // When the edit page is rendered and Back is pressed without confirming
        act(() => wrapperProps.handleBackButtonPress());

        // Then the shared edit lifecycle handles submit, navigation, and restoration before returning to confirmation
        expect(currentPage.props.onNext).toBe(mockSubmitEdit);
        expect(currentPage.props.onMove).toBe(mockMoveToEditPage);
        expect(mockCancelEdit).toHaveBeenCalledTimes(1);
        expect(Navigation.goBack).toHaveBeenCalledWith(
            ROUTES.BANK_ACCOUNT_USD_SETUP.getRoute({
                policyID: 'policy-1',
                page: CONST.BANK_ACCOUNT.PAGE_NAMES.BENEFICIAL_OWNERS,
                subPage: CONST.BANK_ACCOUNT.BENEFICIAL_OWNERS_STEP.SUB_PAGE_NAMES.CONFIRMATION,
                backTo: ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE,
            }),
        );
    });
});
