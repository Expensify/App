import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import {setFeedReimbursable} from '@libs/actions/CompanyCards';
import type * as CardUtils from '@libs/CardUtils';
import {getCompanyFeeds} from '@libs/CardUtils';

import WorkspaceCompanyCardReimbursablePage from '@pages/workspace/companyCards/WorkspaceCompanyCardReimbursablePage';

import CONST from '@src/CONST';
import type {FeedReimbursable, SelectableFeedReimbursable} from '@src/types/onyx/CardFeeds';

import React from 'react';

const POLICY_ID = 'policy1';
const FEED = 'vcf';
const DOMAIN_ACCOUNT_ID = 1234;

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => jest.fn(() => null));
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

jest.mock('@hooks/useOnyx', () => jest.fn(() => [FEED, {status: 'loaded'}]));
jest.mock('@hooks/useCardFeeds', () => jest.fn(() => [{}, {status: 'loaded'}]));
jest.mock('@hooks/useWorkspaceAccountID', () => jest.fn(() => DOMAIN_ACCOUNT_ID));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@libs/actions/CompanyCards', () => ({setFeedReimbursable: jest.fn(), clearErrorField: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/CardUtils', () => {
    const actualCardUtils: typeof CardUtils = jest.requireActual('@libs/CardUtils');
    return {
        ...actualCardUtils,
        getSelectedFeed: jest.fn(() => FEED),
        getCompanyCardFeed: jest.fn(() => FEED),
        getCompanyFeeds: jest.fn(() => ({})),
        getDomainOrWorkspaceAccountID: jest.fn(() => DOMAIN_ACCOUNT_ID),
    };
});

type MockListItem = {value: SelectableFeedReimbursable; isSelected: boolean};
type MockSelectionListProps = {
    data: MockListItem[];
    onSelectRow: (item: MockListItem) => void;
    confirmButtonOptions: {onConfirm: () => void};
};

function renderPageWithStoredValue(forceReimbursable: FeedReimbursable | undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test builds only the feed fields this page reads
    jest.mocked(getCompanyFeeds).mockReturnValue({[FEED]: {forceReimbursable}} as never);
    render(
        <WorkspaceCompanyCardReimbursablePage
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only route.params is read in this page
            route={{params: {policyID: POLICY_ID}} as never}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- navigation object is unused in this test
            navigation={{} as never}
        />,
    );
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList
const getListProps = () => jest.mocked(SelectionList).mock.lastCall?.[0] as unknown as MockSelectionListProps;

const getSelectedValue = () => getListProps().data.find((item) => item.isSelected)?.value;

describe('WorkspaceCompanyCardReimbursablePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('selects Always non-reimbursable when the feed has no stored setting', () => {
        // Given a feed without a stored reimbursable setting
        renderPageWithStoredValue(undefined);

        // Then the default force_no option is selected
        expect(getSelectedValue()).toBe(CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_NO);
    });

    it('does not rewrite a legacy none value when the admin saves without changing it', () => {
        // Given a feed with the legacy none value
        renderPageWithStoredValue(CONST.COMPANY_CARDS.FEED_REIMBURSABLE_LEGACY_NONE);

        // Then it shows as Non-reimbursable
        expect(getSelectedValue()).toBe(CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_NO);

        // When the admin saves without picking another option
        act(() => getListProps().confirmButtonOptions.onConfirm());

        // Then the stored value is left alone
        expect(setFeedReimbursable).not.toHaveBeenCalled();
    });

    it('does not save when the admin re-selects the current option', () => {
        // Given a feed without a stored reimbursable setting
        renderPageWithStoredValue(undefined);

        // When the admin re-selects the effective option and saves
        act(() => getListProps().onSelectRow({value: CONST.COMPANY_CARDS.FEED_REIMBURSABLE.FORCE_NO, isSelected: true}));
        act(() => getListProps().confirmButtonOptions.onConfirm());

        // Then nothing is written
        expect(setFeedReimbursable).not.toHaveBeenCalled();
    });

    it('saves the selected value when the admin changes a legacy none value', () => {
        // Given a feed with the legacy none value
        renderPageWithStoredValue(CONST.COMPANY_CARDS.FEED_REIMBURSABLE_LEGACY_NONE);

        // When the admin picks another option and saves
        act(() => getListProps().onSelectRow({value: CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES, isSelected: false}));
        act(() => getListProps().confirmButtonOptions.onConfirm());

        // Then the chosen value is saved, keeping the stored legacy value for rollback
        expect(setFeedReimbursable).toHaveBeenCalledWith(
            POLICY_ID,
            FEED,
            DOMAIN_ACCOUNT_ID,
            CONST.COMPANY_CARDS.FEED_REIMBURSABLE.DEFAULT_YES,
            CONST.COMPANY_CARDS.FEED_REIMBURSABLE_LEGACY_NONE,
        );
    });
});
