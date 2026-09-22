import {act, render} from '@testing-library/react-native';

import type * as OnyxListItemProviderModule from '@components/OnyxListItemProvider';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import IssueNewCardConfirmValidateCodePage from '@pages/workspace/expensifyCard/issueNew/IssueNewCardConfirmValidateCodePage';

import {issueExpensifyCard} from '@userActions/Card';

import CONST from '@src/CONST';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type {IssueNewCardData} from '@src/types/onyx/Card';

import type {PropsWithChildren} from 'react';

import React from 'react';

const POLICY_ID = 'policy1';
const DEFAULT_FUND_ID = 123;
const VALIDATE_CODE = '123456';

let mockIssueNewCard: {data?: Partial<IssueNewCardData>; isLoading?: boolean} | undefined;

jest.mock('@components/ValidateCodeActionModal/ValidateCodeActionContent', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/OnyxListItemProvider', () => ({
    ...jest.requireActual<typeof OnyxListItemProviderModule>('@components/OnyxListItemProvider'),
    usePersonalDetails: jest.fn(() => ({})),
}));

jest.mock('@hooks/useDefaultCardFeed', () => jest.fn(() => ({fundID: 123, programKey: 'GB'})));
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => {
    const onyxKeys = jest.requireActual<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
    return jest.fn((key: string) => {
        if (typeof key === 'string' && key.startsWith(onyxKeys.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD)) {
            return [mockIssueNewCard];
        }
        return [undefined];
    });
});

jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn(), navigate: jest.fn(), closeRHPFlow: jest.fn()}));
jest.mock('@libs/actions/User', () => ({requestValidateCodeAction: jest.fn()}));
jest.mock('@userActions/Card', () => ({
    clearIssueNewCardError: jest.fn(),
    clearIssueNewCardFlow: jest.fn(),
    issueExpensifyCard: jest.fn(),
}));

type MockValidateCodeActionContentProps = {
    handleSubmitForm: (validateCode: string) => void;
};

function renderPage() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only route stub. The page only reads route.params.policyID
    const props = {
        route: {params: {policyID: POLICY_ID}},
    } as unknown as React.ComponentProps<typeof IssueNewCardConfirmValidateCodePage>;
    return render(<IssueNewCardConfirmValidateCodePage {...props} />);
}

describe('IssueNewCardConfirmValidateCodePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('issues a physical card into the selected program', () => {
        // Given a physical card draft with the GB program selected
        const data: Partial<IssueNewCardData> = {
            assigneeEmail: 'assignee@example.com',
            cardType: CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL,
            limit: 100,
            limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            cardTitle: 'Card',
        };
        mockIssueNewCard = {data};
        renderPage();

        // When the admin submits the magic code
        const mockedContent = jest.mocked(ValidateCodeActionContent);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the mock receives the page's real props
        const {handleSubmitForm} = mockedContent.mock.lastCall?.[0] as unknown as MockValidateCodeActionContentProps;
        act(() => {
            handleSubmitForm(VALIDATE_CODE);
        });

        // Then the selected program is passed through as the feed country
        expect(issueExpensifyCard).toHaveBeenCalledWith(DEFAULT_FUND_ID, POLICY_ID, CONST.COUNTRY.GB, VALIDATE_CODE, undefined, data);
    });
});
