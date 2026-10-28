import {render} from '@testing-library/react-native';

import VacationDelegateMenuItem from '@components/VacationDelegateMenuItem';

import {clearDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import DomainMemberDetailsPage from '@pages/domain/Members/DomainMemberDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import type {PropsWithChildren} from 'react';

import React from 'react';

const DOMAIN_ACCOUNT_ID = 1;
const MEMBER_ACCOUNT_ID = 2;

let mockDomain: Record<string, BaseVacationDelegate> | undefined;

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
}));

jest.mock('@libs/actions/FormActions', () => ({
    clearDraftValues: jest.fn(),
}));

// Renders only the page's own rows, so the test can reach the vacation delegate row without the member header and its data
jest.mock('@pages/domain/BaseDomainMemberDetailsComponent', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/OfflineWithFeedback', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/VacationDelegateMenuItem', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemField', () => jest.fn(() => null));
jest.mock('@components/MenuItem/presets/MenuItemAction', () => jest.fn(() => null));
jest.mock('@components/DecisionModal', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => ({__esModule: true, default: new Proxy({}, {get: () => () => null})}));
jest.mock('@components/Button', () => ({__esModule: true, default: new Proxy({}, {get: () => () => null})}));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: false})));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: jest.fn(() => [{accountID: 2, login: 'member@example.com'}])}));
// Every domain read goes through a selector, so each one is applied to the same mock domain record
jest.mock('@hooks/useOnyx', () => jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => [options?.selector ? options.selector(mockDomain) : undefined]));

type DomainMemberDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.MEMBER_DETAILS>;

const route: DomainMemberDetailsPageProps['route'] = {
    key: 'domain-member-details',
    name: SCREENS.DOMAIN.MEMBER_DETAILS,
    params: {domainAccountID: DOMAIN_ACCOUNT_ID, accountID: MEMBER_ACCOUNT_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as DomainMemberDetailsPageProps['navigation'];

function pressVacationDelegateRow() {
    render(
        <DomainMemberDetailsPage
            route={route}
            navigation={navigation}
        />,
    );
    jest.mocked(VacationDelegateMenuItem).mock.lastCall?.[0].onPress?.();
}

describe('DomainMemberDetailsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDomain = undefined;
    });

    it('opens the vacation delegate form when the member has no delegate', () => {
        // Given a member with no vacation delegate
        // When the admin presses the member's vacation delegate row
        pressVacationDelegateRow();

        // Then the form opens, not the member picker, so the clear after date is set in the same place as the delegate
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(DOMAIN_ACCOUNT_ID, MEMBER_ACCOUNT_ID));
    });

    it('opens the vacation delegate form when the member already has a delegate', () => {
        // Given a member with a saved vacation delegate
        mockDomain = {[`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${MEMBER_ACCOUNT_ID}`]: {creator: 'admin@example.com', delegate: 'delegate@example.com'}};

        // When the admin presses the member's vacation delegate row
        pressVacationDelegateRow();

        // Then the same form opens with a fresh draft, so the saved delegate, date and time are shown rather than a stale pick
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_VACATION_DELEGATE.getRoute(DOMAIN_ACCOUNT_ID, MEMBER_ACCOUNT_ID));
    });
});
