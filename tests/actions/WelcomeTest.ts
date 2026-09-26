import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import {createJoinWorkspaceOnboardingContent} from '@userActions/Welcome';

import type {Report} from '@src/types/onyx';

import createMock from '../utils/createMock';

jest.mock('@libs/API');

const mockWrite = jest.mocked(API.write);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

describe('createJoinWorkspaceOnboardingContent', () => {
    beforeEach(() => {
        mockWrite.mockClear();
    });

    it('sends an Auth-compatible no-workspaces message', () => {
        // Given a surviving Concierge chat with no joinable workspaces.
        const conciergeChat = createMock<Report>({reportID: '123'});

        // When the empty-workspace follow-up is created.
        createJoinWorkspaceOnboardingContent('empty', 'company.com', 'employee@company.com', conciergeChat, undefined);

        // Then the command carries a positive action ID and an object containing nonempty HTML.
        expect(mockWrite).toHaveBeenCalledTimes(1);
        expect(mockWrite.mock.calls.at(0)?.[0]).toBe(WRITE_COMMANDS.CREATE_JOIN_WORKSPACE_ONBOARDING_CONTENT);
        const parameters = mockWrite.mock.calls.at(0)?.[1];
        expect(parameters).toEqual(expect.objectContaining({event: 'noJoinableWorkspacesMessage'}));
        if (!parameters || !('data' in parameters) || typeof parameters.data !== 'string') {
            throw new Error('CreateJoinWorkspaceOnboardingContent did not include serialized data');
        }
        const data = JSON.parse(parameters.data) as unknown;
        const message = isRecord(data) ? data['0'] : undefined;
        if (!isRecord(message) || typeof message.reportActionID !== 'string' || !isRecord(message.reportComment) || typeof message.reportComment.html !== 'string') {
            throw new Error('CreateJoinWorkspaceOnboardingContent did not include a valid message');
        }
        expect(BigInt(message.reportActionID)).toBeGreaterThan(0n);
        expect(message.reportComment.html).not.toBe('');
    });
});
