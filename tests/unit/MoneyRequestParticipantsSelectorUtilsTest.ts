import type {OptionData} from '@libs/ReportUtils';
import {
    filterLowerParticipantSectionOptions,
    getMoneyRequestParticipantSelectionKey,
    resolveInitialSelectedParticipantOptions,
} from '@pages/iou/request/MoneyRequestParticipantsSelectorUtils';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

function buildOption(overrides: Partial<OptionData> = {}): OptionData {
    return {
        text: '',
        displayName: '',
        alternateText: '',
        login: '',
        accountID: CONST.DEFAULT_NUMBER_ID,
        keyForList: '',
        selected: false,
        isSelected: false,
        icons: [],
        ...overrides,
    };
}

describe('MoneyRequestParticipantsSelectorUtils', () => {
    const personalDetails = Object.fromEntries([
        [
            1,
            {
                accountID: 1,
                login: 'selected@test.com',
                displayName: 'Selected User',
                avatar: 'selected-avatar',
                firstName: 'Selected',
                lastName: 'User',
            },
        ],
    ]) as unknown as PersonalDetailsList;

    it('resolves a persisted invoice contact back to the canonical live row', () => {
        const result = resolveInitialSelectedParticipantOptions({
            initialSelectedParticipants: [
                {
                    accountID: 1,
                    login: 'selected@test.com',
                    text: 'Stale Selected',
                    displayName: 'Stale Selected',
                    selected: true,
                    iouType: CONST.IOU.TYPE.INVOICE,
                },
            ],
            workspaceChats: [],
            selfDMChat: null,
            recentReports: [
                buildOption({
                    accountID: 1,
                    login: 'selected@test.com',
                    text: 'Selected User',
                    displayName: 'Selected User',
                    alternateText: 'selected@test.com',
                    keyForList: 'recent-1',
                    icons: [{source: 'selected-avatar', name: 'Selected User', type: CONST.ICON_TYPE_AVATAR}],
                }),
            ],
            personalDetailsOptions: [],
            userToInvite: null,
            personalDetails,
        });

        expect(result).toEqual([
            expect.objectContaining({
                login: 'selected@test.com',
                text: 'Selected User',
                keyForList: 'recent-1',
                isSelected: true,
                selected: true,
            }),
        ]);
    });

    it('resolves workspace and invoice-room rows by reportID', () => {
        const selectedWorkspaceParticipant = {
            reportID: 'invoiceRoom_1',
            policyID: 'policyID',
            text: 'Workspace A',
            isPolicyExpenseChat: true,
            selected: true,
            iouType: CONST.IOU.TYPE.INVOICE,
        } satisfies Participant;

        const result = resolveInitialSelectedParticipantOptions({
            initialSelectedParticipants: [selectedWorkspaceParticipant],
            workspaceChats: [
                buildOption({
                    reportID: 'invoiceRoom_1',
                    policyID: 'policyID',
                    text: 'Workspace A',
                    displayName: 'Workspace A',
                    keyForList: 'invoiceRoom_1',
                }),
            ],
            selfDMChat: null,
            recentReports: [],
            personalDetailsOptions: [],
            userToInvite: null,
            personalDetails,
        });

        expect(result).toEqual([
            expect.objectContaining({
                reportID: 'invoiceRoom_1',
                text: 'Workspace A',
                keyForList: 'invoiceRoom_1',
                isSelected: true,
            }),
        ]);
    });

    it('resolves business invoice receivers against live workspace rows by policyID', () => {
        const result = resolveInitialSelectedParticipantOptions({
            initialSelectedParticipants: [
                {
                    policyID: 'policyID',
                    selected: true,
                    iouType: CONST.IOU.TYPE.INVOICE,
                },
            ],
            workspaceChats: [
                buildOption({
                    reportID: 'invoiceRoom_1',
                    policyID: 'policyID',
                    text: 'Workspace A',
                    displayName: 'Workspace A',
                    keyForList: 'invoiceRoom_1',
                }),
            ],
            selfDMChat: null,
            recentReports: [],
            personalDetailsOptions: [],
            userToInvite: null,
            personalDetails,
        });

        expect(result).toEqual([
            expect.objectContaining({
                reportID: 'invoiceRoom_1',
                policyID: 'policyID',
                text: 'Workspace A',
                isSelected: true,
                selected: true,
            }),
        ]);
    });

    it('creates a visible fallback row when no live option exists', () => {
        const selectedParticipant = {
            login: 'fallback@test.com',
            text: 'Fallback User',
            displayName: 'Fallback User',
            selected: true,
            iouType: CONST.IOU.TYPE.INVOICE,
        } satisfies Participant;

        const result = resolveInitialSelectedParticipantOptions({
            initialSelectedParticipants: [selectedParticipant],
            workspaceChats: [],
            selfDMChat: null,
            recentReports: [],
            personalDetailsOptions: [],
            userToInvite: null,
            personalDetails: {} as PersonalDetailsList,
        });

        expect(result).toEqual([
            expect.objectContaining({
                login: 'fallback@test.com',
                text: 'Fallback User',
                displayName: 'Fallback User',
                isSelected: true,
                selected: true,
            }),
        ]);
    });

    it('does not throw when option groups are missing before initialization', () => {
        expect(() =>
            resolveInitialSelectedParticipantOptions({
                initialSelectedParticipants: [
                    {
                        login: 'fallback@test.com',
                        text: 'Fallback User',
                        displayName: 'Fallback User',
                        selected: true,
                        iouType: CONST.IOU.TYPE.INVOICE,
                    },
                ],
                workspaceChats: undefined,
                selfDMChat: undefined,
                recentReports: undefined,
                personalDetailsOptions: undefined,
                userToInvite: undefined,
                personalDetails: {} as PersonalDetailsList,
            }),
        ).not.toThrow();
    });

    it('uses reportID, accountID, and login in selection keys', () => {
        expect(getMoneyRequestParticipantSelectionKey({reportID: 'reportID'})).toBe('reportID:reportID');
        expect(getMoneyRequestParticipantSelectionKey({accountID: 1})).toBe('accountID:1');
        expect(getMoneyRequestParticipantSelectionKey({login: 'Selected@Test.com'})).toBe('login:selected@test.com');
    });

    it('filters selected workspace and personal rows out of lower sections', () => {
        const result = filterLowerParticipantSectionOptions({
            selectedSectionData: [
                buildOption({
                    reportID: 'workspace-1',
                    policyID: 'policyID',
                    text: 'Workspace A',
                    keyForList: 'workspace-1',
                }),
                buildOption({
                    accountID: 1,
                    login: 'selected@test.com',
                    text: 'Selected User',
                    keyForList: 'selected-user',
                }),
            ],
            workspaceChats: [
                buildOption({
                    reportID: 'workspace-1',
                    policyID: 'policyID',
                    text: 'Workspace A',
                    keyForList: 'workspace-1',
                }),
                buildOption({
                    reportID: 'workspace-2',
                    policyID: 'policyID-2',
                    text: 'Workspace B',
                    keyForList: 'workspace-2',
                }),
            ],
            personalDetailsOptions: [
                buildOption({
                    accountID: 1,
                    login: 'selected@test.com',
                    text: 'Selected User',
                    keyForList: 'selected-user',
                }),
                buildOption({
                    accountID: 2,
                    login: 'other@test.com',
                    text: 'Other User',
                    keyForList: 'other-user',
                }),
            ],
            recentReports: [],
            selfDMChat: null,
            userToInvite: null,
        });

        expect(result.workspaceChats).toEqual([
            expect.objectContaining({
                reportID: 'workspace-2',
                text: 'Workspace B',
            }),
        ]);
        expect(result.personalDetails).toEqual([
            expect.objectContaining({
                login: 'other@test.com',
                text: 'Other User',
            }),
        ]);
    });

    it('filters selected recent rows out of contacts and recents', () => {
        const result = filterLowerParticipantSectionOptions({
            selectedSectionData: [
                buildOption({
                    accountID: 1,
                    login: 'selected@test.com',
                    text: 'Selected User',
                    keyForList: 'selected-user',
                }),
            ],
            workspaceChats: [],
            selfDMChat: null,
            recentReports: [
                buildOption({
                    accountID: 1,
                    login: 'selected@test.com',
                    text: 'Selected User',
                    keyForList: 'recent-selected',
                }),
                buildOption({
                    accountID: 3,
                    login: 'recent@test.com',
                    text: 'Recent User',
                    keyForList: 'recent-user',
                }),
            ],
            personalDetailsOptions: [
                buildOption({
                    accountID: 1,
                    login: 'selected@test.com',
                    text: 'Selected User',
                    keyForList: 'contact-selected',
                }),
                buildOption({
                    accountID: 4,
                    login: 'contact@test.com',
                    text: 'Contact User',
                    keyForList: 'contact-user',
                }),
            ],
            userToInvite: null,
        });

        expect(result.recentReports).toEqual([
            expect.objectContaining({
                login: 'recent@test.com',
                text: 'Recent User',
            }),
        ]);
        expect(result.personalDetails).toEqual([
            expect.objectContaining({
                login: 'contact@test.com',
                text: 'Contact User',
            }),
        ]);
    });
});
