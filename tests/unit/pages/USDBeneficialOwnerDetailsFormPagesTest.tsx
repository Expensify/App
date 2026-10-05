import {act, render} from '@testing-library/react-native';

import InteractiveStepWrapper from '@components/InteractiveStepWrapper';

import useReimbursementAccountConfirmationEdit from '@hooks/useReimbursementAccountConfirmationEdit';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import BeneficialOwnerDetailsFormPages from '@pages/ReimbursementAccount/USD/BeneficialOwnerInfo/BeneficialOwnerDetailsFormPages';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@components/FullscreenLoadingIndicator', () => jest.fn(() => null));
jest.mock('@components/InteractiveStepWrapper', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [{beneficialOwnerKeys: []}]));
jest.mock('@hooks/useReimbursementAccountConfirmationEdit', () => jest.fn());
jest.mock('@hooks/useSubPage', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));

const mockCancelEdit = jest.fn();

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
            nextPage: jest.fn(),
            moveTo: jest.fn(),
            resetToPage: jest.fn(),
            isRedirecting: false,
        });
        jest.mocked(useReimbursementAccountConfirmationEdit).mockReturnValue({
            moveToEditPage: jest.fn(),
            submitEdit: jest.fn(),
            cancelEdit: mockCancelEdit,
        });
    });

    it('restores the confirmed draft when Back cancels a beneficial-owner edit', () => {
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

        act(() => wrapperProps.handleBackButtonPress());

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
