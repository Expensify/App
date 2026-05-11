import React from 'react';
import {render, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import WorkspaceRestrictedActionPage from '@pages/RestrictedAction/Workspace/WorkspaceRestrictedActionPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as PolicyUtils from '@libs/PolicyUtils';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/usePolicy', () => jest.fn(() => ({
    id: '1',
    name: 'Test Policy',
    role: 'user',
})));
jest.mock('@libs/actions/Subscription', () => ({
    openSubscriptionPage: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
}));

const mockPolicy = {
    id: '1',
    name: 'Test Policy',
    role: 'user',
};

const mockSession = {
    accountID: 123,
    email: 'test@example.com',
};

describe('WorkspaceRestrictedActionPage', () => {
    beforeEach(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: mockSession,
                [ONYXKEYS.IS_LOADING_SUBSCRIPTION_DATA]: false,
                [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: null,
                [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: null,
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders WorkspaceOwnerRestrictedAction for owner role', () => {
        jest.spyOn(PolicyUtils, 'isPolicyOwner').mockReturnValue(true);
        jest.spyOn(PolicyUtils, 'isPolicyAdmin').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyUser').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAuditor').mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={{params: {policyID: '1'}}} />);
        expect(screen.getByTestId('workspace-owner-restricted-action')).toBeTruthy();
    });

    it('renders WorkspaceAdminRestrictedAction for admin role', () => {
        jest.spyOn(PolicyUtils, 'isPolicyOwner').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAdmin').mockReturnValue(true);
        jest.spyOn(PolicyUtils, 'isPolicyUser').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAuditor').mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={{params: {policyID: '1'}}} />);
        expect(screen.getByTestId('workspace-admin-restricted-action')).toBeTruthy();
    });

    it('renders WorkspaceUserRestrictedAction for user role', () => {
        jest.spyOn(PolicyUtils, 'isPolicyOwner').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAdmin').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyUser').mockReturnValue(true);
        jest.spyOn(PolicyUtils, 'isPolicyAuditor').mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={{params: {policyID: '1'}}} />);
        expect(screen.getByTestId('workspace-user-restricted-action')).toBeTruthy();
    });

    it('renders WorkspaceUserRestrictedAction for auditor role', () => {
        jest.spyOn(PolicyUtils, 'isPolicyOwner').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAdmin').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyUser').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAuditor').mockReturnValue(true);

        render(<WorkspaceRestrictedActionPage route={{params: {policyID: '1'}}} />);
        expect(screen.getByTestId('workspace-user-restricted-action')).toBeTruthy();
    });

    it('renders NotFoundPage for unknown role', () => {
        jest.spyOn(PolicyUtils, 'isPolicyOwner').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAdmin').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyUser').mockReturnValue(false);
        jest.spyOn(PolicyUtils, 'isPolicyAuditor').mockReturnValue(false);

        render(<WorkspaceRestrictedActionPage route={{params: {policyID: '1'}}} />);
        expect(screen.getByTestId('not-found-page')).toBeTruthy();
    });
});