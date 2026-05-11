import {inviteMemberViaMention} from '@src/libs/actions/Report';
import API from '@src/libs/API';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import CONST from '@src/CONST';

jest.mock('@src/libs/API');
jest.mock('react-native-onyx');

describe('inviteMemberViaMention', () => {
    const mockReportID = '12345';
    const mockEmail = 'test@example.com';
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('should call API.write with correct parameters', () => {
        inviteMemberViaMention(mockReportID, mockEmail);
        
        expect(API.write).toHaveBeenCalledWith('InviteToRoom', {
            reportID: mockReportID,
            inviteeLogin: mockEmail.toLowerCase(),
            shouldSendInviteEmail: true,
        });
    });
    
    it('should normalize email to lowercase', () => {
        const mixedCaseEmail = 'Test@Example.COM';
        inviteMemberViaMention(mockReportID, mixedCaseEmail);
        
        expect(API.write).toHaveBeenCalledWith('InviteToRoom', {
            reportID: mockReportID,
            inviteeLogin: 'test@example.com',
            shouldSendInviteEmail: true,
        });
    });
    
    it('should update Onyx with pending action', () => {
        inviteMemberViaMention(mockReportID, mockEmail);
        
        expect(Onyx.merge).toHaveBeenCalledWith(
            `${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`,
            {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            }
        );
    });
    
    it('should not call API for invalid email', () => {
        const invalidEmail = 'invalid-email';
        inviteMemberViaMention(mockReportID, invalidEmail);
        
        expect(API.write).not.toHaveBeenCalled();
    });
    
    it('should handle empty email gracefully', () => {
        inviteMemberViaMention(mockReportID, '');
        
        expect(API.write).not.toHaveBeenCalled();
    });
});