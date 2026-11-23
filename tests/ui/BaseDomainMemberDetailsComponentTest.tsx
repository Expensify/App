// Fallback navigation supplied by a details page must reach the domain access wrapper.
import {render} from '@testing-library/react-native';

import BaseDomainMemberDetailsComponent from '@pages/domain/BaseDomainMemberDetailsComponent';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import React from 'react';

jest.mock('@pages/domain/DomainNotFoundPageWrapper', () => jest.fn(() => null));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone}));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: () => [{login: 'member@example.com'}]}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));

describe('BaseDomainMemberDetailsComponent fallback', () => {
    beforeEach(() => jest.clearAllMocks());

    it('forwards a page-specific Not Found back action', () => {
        // Given a page supplies its own fallback navigation
        const fullPageNotFoundViewProps = {onBackButtonPress: jest.fn()};

        // When its member details are blocked
        render(
            <BaseDomainMemberDetailsComponent
                domainAccountID={100}
                accountID={300}
                shouldBeBlocked
                fullPageNotFoundViewProps={fullPageNotFoundViewProps}
            />,
        );

        // Then the access wrapper receives that same fallback, not just the blocking flag
        expect(jest.mocked(DomainNotFoundPageWrapper).mock.lastCall?.[0]).toMatchObject({
            domainAccountID: 100,
            shouldBeBlocked: true,
            fullPageNotFoundViewProps,
        });
    });

    it('leaves the default fallback unchanged when no override is supplied', () => {
        // Given ordinary member details do not customize Not Found navigation
        // When they are rendered
        render(
            <BaseDomainMemberDetailsComponent
                domainAccountID={100}
                accountID={300}
            />,
        );

        // Then the wrapper can still use its existing default back action
        expect(jest.mocked(DomainNotFoundPageWrapper).mock.lastCall?.[0].fullPageNotFoundViewProps).toBeUndefined();
    });
});
