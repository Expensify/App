import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ReportActionItem from '@components/ReportActionItem';
import * as Report from '@userActions/Report';

jest.mock('@userActions/Report');

describe('ReportActionItem', () => {
    it('should render invite whisper message with Invite to chat button for non-Expensify users', () => {
        const action = {
            actionName: 'INVITE',
            message: 'Invited test@gmail.com to the room',
            created: '2024-01-01',
            sequenceNumber: 1,
        };
        
        const {getByText} = render(
            <ReportActionItem action={action} reportID="123" />
        );
        
        expect(getByText('Invited test@gmail.com to the room')).toBeTruthy();
        expect(getByText('Invite to chat')).toBeTruthy();
    });

    it('should not render Invite to chat button for Expensify users', () => {
        const action = {
            actionName: 'INVITE',
            message: 'Invited test@expensify.com to the room',
            created: '2024-01-01',
            sequenceNumber: 1,
        };
        
        const {queryByText} = render(
            <ReportActionItem action={action} reportID="123" />
        );
        
        expect(queryByText('Invite to chat')).toBeNull();
    });

    it('should call inviteToRoom when Invite to chat button is pressed', () => {
        const action = {
            actionName: 'INVITE',
            message: 'Invited test@gmail.com to the room',
            created: '2024-01-01',
            sequenceNumber: 1,
        };
        
        const {getByText} = render(
            <ReportActionItem action={action} reportID="123" />
        );
        
        fireEvent.press(getByText('Invite to chat'));
        
        expect(Report.inviteToRoom).toHaveBeenCalledWith('123', ['test@gmail.com'], '');
    });
});