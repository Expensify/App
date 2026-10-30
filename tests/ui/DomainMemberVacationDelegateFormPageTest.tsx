import {render} from '@testing-library/react-native';

import DelegatorList from '@components/DelegatorList';
import VacationDelegateForm from '@components/VacationDelegateForm';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DomainMemberVacationDelegateFormPage from '@pages/domain/Members/DomainMemberVacationDelegateFormPage';

import SCREENS from '@src/SCREENS';
import type {PersonalDetails} from '@src/types/onyx';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import type {PropsWithChildren} from 'react';

import React from 'react';

const DOMAIN_ACCOUNT_ID = 1;
const MEMBER_ACCOUNT_ID = 2;
const MEMBER_EMAIL = 'member@example.com';
const MEMBER_TIMEZONE = 'Asia/Tokyo';

let mockVacationDelegate: BaseVacationDelegate | undefined;
let mockMemberPersonalDetails: PersonalDetails | undefined;

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => jest.fn(() => null));
jest.mock('@pages/domain/DomainNotFoundPageWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/VacationDelegateForm', () => jest.fn(() => null));
jest.mock('@components/DelegatorList', () => jest.fn(() => null));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'admin@example.com', timezone: {selected: 'America/Los_Angeles'}})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockVacationDelegate]));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: jest.fn(() => [mockMemberPersonalDetails])}));

type DomainMemberVacationDelegateFormPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE>;

const route: DomainMemberVacationDelegateFormPageProps['route'] = {
    key: 'domain-vacation-delegate',
    name: SCREENS.DOMAIN.VACATION_DELEGATE,
    params: {domainAccountID: DOMAIN_ACCOUNT_ID, accountID: MEMBER_ACCOUNT_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as DomainMemberVacationDelegateFormPageProps['navigation'];

function renderPage() {
    return render(
        <DomainMemberVacationDelegateFormPage
            route={route}
            navigation={navigation}
        />,
    );
}

describe('DomainMemberVacationDelegateFormPage', () => {
    const mockedVacationDelegateForm = jest.mocked(VacationDelegateForm);
    const mockedDelegatorList = jest.mocked(DelegatorList);

    beforeEach(() => {
        jest.clearAllMocks();
        mockVacationDelegate = {creator: 'admin@example.com', delegate: 'delegate@example.com'};
        mockMemberPersonalDetails = {accountID: MEMBER_ACCOUNT_ID, login: MEMBER_EMAIL, timezone: {selected: MEMBER_TIMEZONE}};
    });

    it('picks the clear date in the member’s timezone, not the admin’s', () => {
        // Given an admin in Los Angeles editing the delegate of a member whose Profile timezone is Tokyo
        // When the form page opens
        renderPage();

        // Then the form reads and builds the clear date in the member's timezone, so the delegate clears at the end of the vacationer's day
        expect(mockedVacationDelegateForm.mock.lastCall?.[0]).toEqual(expect.objectContaining({timezone: MEMBER_TIMEZONE}));
        expect(mockedDelegatorList).not.toHaveBeenCalled();
    });

    it('shows the delegator list instead of the form while the member is someone else’s delegate', () => {
        // Given a member with a saved delegate, who is also the vacation delegate for another member
        mockVacationDelegate = {creator: 'admin@example.com', delegate: 'delegate@example.com', delegatorFor: ['other@example.com']};

        // When the form page opens
        renderPage();

        // Then the admin can't change the date or remove the delegate, same as on the member picker
        expect(mockedVacationDelegateForm).not.toHaveBeenCalled();
        expect(mockedDelegatorList.mock.lastCall?.[0]).toEqual({
            delegators: ['other@example.com'],
            message: 'domain.members.cannotSetVacationDelegateForMember',
        });
    });
});
