import React from 'react';
import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import WorkspaceRestrictedActionPage from '@pages/RestrictedAction/Workspace/WorkspaceRestrictedActionPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import Navigation from '@libs/Navigation/Navigation';

jest.mock('@libs/PolicyUtils');
jest.mock('@libs/SubscriptionUtils');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({})));
jest.mock('@components/FullscreenLoadingIndicator', () => 'FullScreenLoadingIndicator');
jest.mock('@pages/ErrorPage/NotFoundPage', () => 'NotFoundPage');
jest.mock('../WorkspaceAdminRestrictedAction', () => 'WorkspaceAdminRestrictedAction');
jest.mock('../WorkspaceOwnerRestrictedAction', () => 'WorkspaceOwnerRestrictedAction');
jest.mock('../WorkspaceUserRestrictedAction', () => 'WorkspaceUserRestrictedAction');

const mockPolicyID = 'policy123';
const mockRoute = {
    params: {policyID: mockPolicyID},
    key: 'test-key',
    name: 'RestrictedAction_Root',
};

describe('WorkspaceRestrictedActionPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 1, email: 'test@test.com'},
                [ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA]: false,
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: null,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 100,
            },
        });
        (SubscriptionUtils.shouldRestrictUserBillableActions as jest.Mock).mockReturnValue(true);
    });

    it('renders WorkspaceOwnerRestrictedAction for owner role', () => {
        (PolicyUtils.isPolicyOwner as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPolicyAdmin as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAuditor as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyUser as jest.Mock).mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={mockRoute} />);
        expect(screen.getByTestId('WorkspaceOwnerRestrictedAction')).toBeTruthy();
    });

    it('renders WorkspaceAdminRestrictedAction for admin role', () => {
        (PolicyUtils.isPolicyOwner as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAdmin as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPolicyAuditor as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyUser as jest.Mock).mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={mockRoute} />);
        expect(screen.getByTestId('WorkspaceAdminRestrictedAction')).toBeTruthy();
    });

    it('renders WorkspaceUserRestrictedAction for user role', () => {
        (PolicyUtils.isPolicyOwner as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAdmin as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAuditor as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyUser as jest.Mock).mockReturnValue(true);

        render(<WorkspaceRestrictedActionPage route={mockRoute} />);
        expect(screen.getByTestId('WorkspaceUserRestrictedAction')).toBeTruthy();
    });

    it('renders WorkspaceUserRestrictedAction for auditor role', () => {
        (PolicyUtils.isPolicyOwner as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAdmin as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAuditor as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPolicyUser as jest.Mock).mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={mockRoute} />);
        expect(screen.getByTestId('WorkspaceUserRestrictedAction')).toBeTruthy();
    });

    it('renders NotFoundPage for unknown role', () => {
        (PolicyUtils.isPolicyOwner as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAdmin as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAuditor as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyUser as jest.Mock).mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={mockRoute} />);
        expect(screen.getByTestId('NotFoundPage')).toBeTruthy();
    });

    it('navigates back when restriction should not apply', () => {
        (SubscriptionUtils.shouldRestrictUserBillableActions as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyOwner as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAdmin as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAuditor as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPolicyUser as jest.Mock).mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={mockRoute} />);
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    it('shows loading indicator when offline', () => {
        jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: true})));
        (PolicyUtils.isPolicyOwner as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAdmin as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPolicyAuditor as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPolicyUser as jest.Mock).mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={mockRoute} />);
        expect(screen.getByTestId('FullScreenLoadingIndicator')).toBeTruthy();
    });
});