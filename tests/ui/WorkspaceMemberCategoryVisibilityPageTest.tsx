import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';

import useConfirmModal from '@hooks/useConfirmModal';
import useOnyx from '@hooks/useOnyx';

import {setPolicyMemberCategoryVisibility} from '@libs/actions/Policy/Category';
import {clearWorkspaceMembersSelectedForBulkEdit} from '@libs/actions/Policy/Member';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

import WorkspaceMemberCategoryVisibilityPage from '@pages/workspace/members/WorkspaceMemberCategoryVisibilityPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, PolicyCategories} from '@src/types/onyx';

import type React from 'react';
import type {PropsWithChildren} from 'react';

import {isValidElement} from 'react';

import createMock from '../utils/createMock';

const POLICY_ID = 'policy123';
const MEMBER_1_ACCOUNT_ID = 1;
const MEMBER_2_ACCOUNT_ID = 2;
const MEMBER_1_LOGIN = 'member1@example.com';
const MEMBER_2_LOGIN = 'member2@example.com';

// Member 1 can only use Meals, while member 2 can use every category
const mockPolicyCategories: PolicyCategories = {
    Meals: {name: 'Meals', enabled: true, visibleTo: {[MEMBER_1_ACCOUNT_ID]: true, [MEMBER_2_ACCOUNT_ID]: true}},
    Travel: {name: 'Travel', enabled: true, visibleTo: {[MEMBER_2_ACCOUNT_ID]: true}},
    Fuel: {name: 'Fuel', enabled: true, visibleTo: {[MEMBER_2_ACCOUNT_ID]: true}},
};

jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock('@components/FormAlertWithSubmitButton', () => jest.fn(() => null));
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/ScrollView', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
jest.mock('@hooks/useInitialSelection', () => jest.fn((initialSelection: string[]) => initialSelection));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyIllustrations: jest.fn(() => ({}))}));
jest.mock('@hooks/useLoadPolicyCategories', () => jest.fn(() => ({isLoadingCompletePolicyCategories: false})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key, localeCompare: (a: string, b: string) => a.localeCompare(b)})));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePersonalDetailByLogin', () => ({
    usePersonalDetailsByLogins: jest.fn(() => ({
        [MEMBER_1_LOGIN]: {accountID: MEMBER_1_ACCOUNT_ID, login: MEMBER_1_LOGIN},
        [MEMBER_2_LOGIN]: {accountID: MEMBER_2_ACCOUNT_ID, login: MEMBER_2_LOGIN},
    })),
}));
jest.mock('@hooks/usePolicyCategoryPickerCategories', () =>
    jest.fn(() => ({categories: Object.values(mockPolicyCategories), policyCategories: mockPolicyCategories, areCategoriesEnabled: true, isLoading: false})),
);
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => jest.fn(() => ({canWrite: true})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/actions/Policy/Category', () => ({setPolicyMemberCategoryVisibility: jest.fn()}));
jest.mock('@libs/actions/Policy/Member', () => ({clearWorkspaceMembersSelectedForBulkEdit: jest.fn()}));
jest.mock('@libs/Growl', () => ({__esModule: true, default: {success: jest.fn()}}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn(), isNavigationReady: jest.fn(() => Promise.resolve())}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({__esModule: true, default: jest.fn(({children}: PropsWithChildren) => children)}));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

type PageProps = React.ComponentProps<typeof WorkspaceMemberCategoryVisibilityPage> & {policy: Policy};

describe('WorkspaceMemberCategoryVisibilityPage', () => {
    const policy = createMock<Policy>({
        id: POLICY_ID,
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        areCategoriesEnabled: true,
        employeeList: {
            [MEMBER_1_LOGIN]: {email: MEMBER_1_LOGIN},
            [MEMBER_2_LOGIN]: {email: MEMBER_2_LOGIN},
        },
    });
    const getListProps = () => {
        const listProps = jest.mocked(SelectionList).mock.lastCall?.[0];
        if (!listProps) {
            throw new Error('The category list was not rendered');
        }
        return listProps;
    };
    const toggle = (categoryName: string) => act(() => getListProps().onSelectRow(createMock<ListItem & {value: string}>({keyForList: categoryName, value: categoryName})));
    const save = () => {
        const footer = getListProps().footerContent;
        if (!isValidElement<{onSubmit: () => void}>(footer)) {
            throw new Error('The save button was not rendered');
        }
        act(() => footer.props.onSubmit());
    };

    const renderPage = (route: Partial<PageProps['route']>) => {
        // The HOC mock exposes the wrapped screen directly, which accepts the policy prop that the production HOC normally injects.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the test HOC mock returns the unwrapped component with its injected policy prop restored
        const UnwrappedPage = WorkspaceMemberCategoryVisibilityPage as React.ComponentType<PageProps>;
        render(<UnwrappedPage {...createMock<PageProps>({policy, route: createMock<PageProps['route']>(route)})} />);
    };
    const renderBulkEdit = () => renderPage({name: SCREENS.WORKSPACE.MEMBERS_BULK_CATEGORY_VISIBILITY, params: {policyID: POLICY_ID}});

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useOnyx).mockReturnValue([{policyID: POLICY_ID, accountIDs: [MEMBER_1_ACCOUNT_ID, MEMBER_2_ACCOUNT_ID]}, {status: 'loaded'}]);
    });

    it('starts the bulk edit with nothing checked, since the selected members use different categories', () => {
        // Given two selected members, one restricted to Meals and one who can use every category
        // When the admin opens the bulk edit
        renderBulkEdit();

        // Then no category is checked, so the admin picks the categories every selected member will get
        expect(getListProps().selectedItems).toEqual([]);
    });

    it('sets the checked categories for every selected member and confirms it once the page closes', () => {
        // Given the bulk edit for two members
        renderBulkEdit();

        // When the admin checks Meals and Travel and saves
        toggle('Meals');
        toggle('Travel');
        save();

        // Then both members get exactly those categories, the page goes back to the members list and clears the selection
        // once it has closed, and a toast says how many categories were set for how many members
        expect(setPolicyMemberCategoryVisibility).toHaveBeenCalledWith(
            POLICY_ID,
            [MEMBER_1_ACCOUNT_ID, MEMBER_2_ACCOUNT_ID],
            ['Meals', 'Travel'],
            mockPolicyCategories,
            [MEMBER_1_ACCOUNT_ID, MEMBER_2_ACCOUNT_ID],
            [MEMBER_1_LOGIN, MEMBER_2_LOGIN],
        );
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACE_MEMBERS.getRoute(POLICY_ID), {afterTransition: clearWorkspaceMembersSelectedForBulkEdit});
        expect(Growl.success).toHaveBeenCalledWith({bodyText: 'workspace.people.bulkCategoryVisibilitySaved'});
    });

    it('blocks saving the bulk edit with nothing checked', () => {
        // Given the bulk edit, which starts with nothing checked
        const showConfirmModal = jest.fn();
        jest.mocked(useConfirmModal).mockReturnValue(createMock<ReturnType<typeof useConfirmModal>>({showConfirmModal}));
        renderBulkEdit();

        // When the admin saves without checking a category
        save();

        // Then the "at least one category" modal shows and nothing is saved
        expect(showConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'workspace.people.categoryVisibilityRequiredModal.title'}));
        expect(setPolicyMemberCategoryVisibility).not.toHaveBeenCalled();
    });

    it('still starts a single member’s edit with the categories they can use checked', () => {
        // Given member 1, who can only use Meals
        // When the admin opens their category visibility from the member's details
        renderPage({name: SCREENS.WORKSPACE.MEMBER_DETAILS_CATEGORY_VISIBILITY, params: {policyID: POLICY_ID, accountID: String(MEMBER_1_ACCOUNT_ID)}});

        // Then only Meals is checked, as before the bulk edit existed
        expect(getListProps().selectedItems).toEqual(['Meals']);
    });
});
