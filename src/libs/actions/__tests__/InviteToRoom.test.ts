import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import inviteToRoom from '@userActions/InviteToRoom';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/API');

describe('InviteToRoom', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call InviteToRoom API with correct parameters', () => {
        const reportID = '123';
        const emails = ['test@example.com'];
        const welcomeMessage = 'Welcome!';
        
        inviteToRoom(reportID, emails, welcomeMessage);
        
        expect(API.write).toHaveBeenCalledWith(
            'InviteToRoom',
            {
                reportID,
                inviteeEmails: emails,
                welcomeMessage,
            },
            expect.any(Object)
        );
    });

    it('should call fallback InviteMemberToWorkspace on failure for non-Expensify emails', () => {
        const reportID = '123';
        const emails = ['test@gmail.com'];
        const welcomeMessage = 'Welcome!';
        
        // Mock API.write to call onFailure
        (API.write as jest.Mock).mockImplementation((command, params, callbacks) => {
            if (command === 'InviteToRoom') {
                callbacks.onFailure(new Error('Invite failed'));
            }
        });
        
        inviteToRoom(reportID, emails, welcomeMessage);
        
        expect(API.write).toHaveBeenCalledTimes(2);
        expect(API.write).toHaveBeenLastCalledWith(
            'InviteMemberToWorkspace',
            {
                inviteeEmails: emails,
                welcomeMessage,
            },
            expect.any(Object)
        );
    });

    it('should not call fallback for Expensify emails on failure', () => {
        const reportID = '123';
        const emails = ['test@expensify.com'];
        const welcomeMessage = 'Welcome!';
        
        (API.write as jest.Mock).mockImplementation((command, params, callbacks) => {
            if (command === 'InviteToRoom') {
                callbacks.onFailure(new Error('Invite failed'));
            }
        });
        
        inviteToRoom(reportID, emails, welcomeMessage);
        
        expect(API.write).toHaveBeenCalledTimes(1);
    });
});