import type {OptionData} from '@libs/ReportUtils';
import {buildMoneyRequestAttendeeSections, normalizeAttendeeToOption} from '@pages/iou/request/MoneyRequestAttendeeSelectorUtils';
import CONST from '@src/CONST';
import type {Attendee} from '@src/types/onyx/IOU';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

function buildOption(login: string, accountID: number, isSelected = false): OptionData {
    return {
        login,
        text: login,
        displayName: login,
        keyForList: login,
        accountID,
        isSelected,
        selected: isSelected,
        reportID: undefined,
    };
}

function buildLargeOptions() {
    return {
        recentReports: [
            buildOption('alpha@test.com', 1, true),
            buildOption('beta@test.com', 2, true),
            buildOption('gamma@test.com', 3),
            buildOption('delta@test.com', 4),
            buildOption('epsilon@test.com', 5),
        ],
        personalDetails: [
            buildOption('zeta@test.com', 6),
            buildOption('eta@test.com', 7),
            buildOption('theta@test.com', 8),
            buildOption('iota@test.com', 9),
        ],
    };
}

describe('MoneyRequestAttendeeSelectorUtils', () => {
    const translate = (key: 'common.recents' | 'common.contacts') => key;
    const personalDetails = Object.fromEntries([
        [
            1,
            {
                accountID: 1,
                login: 'selected@test.com',
                displayName: 'Selected User',
                avatar: 'avatar-url',
                firstName: 'Selected',
                lastName: 'User',
            },
        ],
    ]) as unknown as PersonalDetailsList;

    it('normalizes attendees into hydrated participant options with stable display fields', () => {
        const attendee = {
            accountID: 1,
            email: 'selected@test.com',
            displayName: 'Selected User',
            avatarUrl: 'avatar-url',
            selected: true,
            iouType: CONST.IOU.TYPE.SUBMIT,
        } satisfies Attendee;

        const result = normalizeAttendeeToOption(attendee, personalDetails);

        expect(result).toEqual(
            expect.objectContaining({
                accountID: 1,
                login: 'selected@test.com',
                text: 'Selected User',
                alternateText: 'selected@test.com',
                keyForList: '1',
                isSelected: true,
                selected: true,
                icons: [expect.objectContaining({source: 'avatar-url', name: 'selected@test.com'})],
            }),
        );
    });

    it('keeps newly selected attendees inline while showing only the initial attendees in the frozen top section', () => {
        const searchOptions = buildLargeOptions();
        const initialSelectedOptions = [buildOption('alpha@test.com', 1, true)];
        const selectedOptions = [buildOption('alpha@test.com', 1, true), buildOption('beta@test.com', 2, true)];

        const result = buildMoneyRequestAttendeeSections({
            searchTerm: '',
            recentReports: searchOptions.recentReports,
            personalDetails: searchOptions.personalDetails,
            userToInvite: null,
            selectedOptions,
            initialSelectedOptions,
            areOptionsInitialized: true,
            translate,
        });

        expect(result).toHaveLength(3);
        expect(result.at(0)?.data).toEqual([expect.objectContaining({login: 'alpha@test.com', isSelected: true})]);
        expect(result.at(1)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'beta@test.com', isSelected: true})]));
        expect(result.at(1)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'alpha@test.com'})]));
    });

    it('keeps deselected initial attendees in the frozen section but marks them unselected', () => {
        const searchOptions = buildLargeOptions();
        const initialSelectedOptions = [buildOption('alpha@test.com', 1, true)];

        const result = buildMoneyRequestAttendeeSections({
            searchTerm: '',
            recentReports: searchOptions.recentReports,
            personalDetails: searchOptions.personalDetails,
            userToInvite: null,
            selectedOptions: [],
            initialSelectedOptions,
            areOptionsInitialized: true,
            translate,
        });

        expect(result.at(0)?.data).toEqual([expect.objectContaining({login: 'alpha@test.com', isSelected: false, selected: false})]);
    });

    it('keeps the full remaining recents and contacts list visible after reopen', () => {
        const result = buildMoneyRequestAttendeeSections({
            searchTerm: '',
            recentReports: [
                buildOption('alpha@test.com', 1, true),
                buildOption('beta@test.com', 2),
                buildOption('gamma@test.com', 3),
                buildOption('delta@test.com', 4),
                buildOption('epsilon@test.com', 5),
            ],
            personalDetails: [
                buildOption('selected-contact@test.com', 6, true),
                buildOption('zeta@test.com', 7),
                buildOption('eta@test.com', 8),
                buildOption('theta@test.com', 9),
                buildOption('iota@test.com', 10),
            ],
            userToInvite: null,
            selectedOptions: [buildOption('alpha@test.com', 1, true), buildOption('selected-contact@test.com', 6, true)],
            initialSelectedOptions: [buildOption('alpha@test.com', 1, true), buildOption('selected-contact@test.com', 6, true)],
            areOptionsInitialized: true,
            translate,
        });

        expect(result).toHaveLength(3);
        expect(result.at(0)?.data).toEqual(
            expect.arrayContaining([expect.objectContaining({login: 'alpha@test.com'}), expect.objectContaining({login: 'selected-contact@test.com'})]),
        );
        expect(result.at(1)?.data).toHaveLength(4);
        expect(result.at(1)?.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'beta@test.com'}),
                expect.objectContaining({login: 'gamma@test.com'}),
                expect.objectContaining({login: 'delta@test.com'}),
                expect.objectContaining({login: 'epsilon@test.com'}),
            ]),
        );
        expect(result.at(2)?.data).toHaveLength(4);
        expect(result.at(2)?.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'zeta@test.com'}),
                expect.objectContaining({login: 'eta@test.com'}),
                expect.objectContaining({login: 'theta@test.com'}),
                expect.objectContaining({login: 'iota@test.com'}),
            ]),
        );
    });

    it('dedupes hydrated search rows against canonical selected attendees even when the selected option only has a login fallback', () => {
        const canonicalSelectedAttendee = normalizeAttendeeToOption(
            {
                accountID: CONST.DEFAULT_NUMBER_ID,
                email: 'selected@test.com',
                displayName: 'Selected User',
                avatarUrl: '',
                selected: true,
                iouType: CONST.IOU.TYPE.SUBMIT,
            },
            {} as PersonalDetailsList,
        );

        const result = buildMoneyRequestAttendeeSections({
            searchTerm: '',
            recentReports: [
                {
                    ...buildOption('selected@test.com', 1, true),
                    text: 'Selected User',
                    displayName: 'Selected User',
                    alternateText: 'selected@test.com',
                },
                buildOption('beta@test.com', 2),
                buildOption('gamma@test.com', 3),
                buildOption('delta@test.com', 4),
                buildOption('epsilon@test.com', 5),
            ],
            personalDetails: [buildOption('zeta@test.com', 6), buildOption('eta@test.com', 7), buildOption('theta@test.com', 8), buildOption('iota@test.com', 9)],
            userToInvite: null,
            selectedOptions: [canonicalSelectedAttendee],
            initialSelectedOptions: [canonicalSelectedAttendee],
            areOptionsInitialized: true,
            translate,
        });

        expect(result.at(0)?.data).toEqual([expect.objectContaining({login: 'selected@test.com', text: 'Selected User'})]);
        expect(result.at(1)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'selected@test.com'})]));
    });

    it('does not hide a real contact when a name-only attendee shares the same display name', () => {
        const nameOnlySelectedAttendee = normalizeAttendeeToOption(
            {
                accountID: CONST.DEFAULT_NUMBER_ID,
                email: '',
                displayName: 'Alex Smith',
                avatarUrl: '',
                selected: true,
                iouType: CONST.IOU.TYPE.SUBMIT,
            },
            {} as PersonalDetailsList,
        );

        const result = buildMoneyRequestAttendeeSections({
            searchTerm: '',
            recentReports: [
                buildOption('alpha@test.com', 1),
                buildOption('beta@test.com', 2),
                buildOption('gamma@test.com', 3),
                buildOption('delta@test.com', 4),
                buildOption('epsilon@test.com', 5),
            ],
            personalDetails: [
                {
                    ...buildOption('alex@example.com', 6),
                    displayName: 'Alex Smith',
                    text: 'Alex Smith',
                    alternateText: 'alex@example.com',
                },
                buildOption('zeta@test.com', 7),
                buildOption('eta@test.com', 8),
                buildOption('theta@test.com', 9),
                buildOption('iota@test.com', 10),
            ],
            userToInvite: null,
            selectedOptions: [nameOnlySelectedAttendee],
            initialSelectedOptions: [nameOnlySelectedAttendee],
            areOptionsInitialized: true,
            translate,
        });

        expect(result.at(0)?.data).toEqual([expect.objectContaining({login: 'Alex Smith'})]);
        expect(result.at(2)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'alex@example.com'})]));
    });

    it('hides the frozen section while searching and keeps matching selected attendees inline', () => {
        const recentReports = [buildOption('alpha@test.com', 1, true), buildOption('beta@test.com', 2)];
        const result = buildMoneyRequestAttendeeSections({
            searchTerm: 'alpha',
            recentReports,
            personalDetails: [],
            userToInvite: null,
            selectedOptions: [buildOption('alpha@test.com', 1, true)],
            initialSelectedOptions: [buildOption('alpha@test.com', 1, true)],
            areOptionsInitialized: true,
            translate,
        });

        expect(result).toHaveLength(1);
        expect(result.at(0)?.title).toBe('common.recents');
        expect(result.at(0)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'alpha@test.com', isSelected: true})]));
    });

    it('skips the frozen top section for small lists unless the initial attendee is outside the base results', () => {
        const smallRecents = [buildOption('alpha@test.com', 1, true), buildOption('beta@test.com', 2)];
        const smallContacts = [buildOption('gamma@test.com', 3), buildOption('delta@test.com', 4)];

        const inlineResult = buildMoneyRequestAttendeeSections({
            searchTerm: '',
            recentReports: smallRecents,
            personalDetails: smallContacts,
            userToInvite: null,
            selectedOptions: [buildOption('alpha@test.com', 1, true)],
            initialSelectedOptions: [buildOption('alpha@test.com', 1, true)],
            areOptionsInitialized: true,
            translate,
        });

        expect(inlineResult.at(0)?.title).toBe('common.recents');
        expect(inlineResult.at(0)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'alpha@test.com', isSelected: true})]));

        const unmatchedInitialOption = {
            ...buildOption('name-only attendee', CONST.DEFAULT_NUMBER_ID, true),
            displayName: 'name-only attendee',
            text: 'name-only attendee',
        };

        const unmatchedResult = buildMoneyRequestAttendeeSections({
            searchTerm: '',
            recentReports: smallRecents,
            personalDetails: smallContacts,
            userToInvite: null,
            selectedOptions: [unmatchedInitialOption],
            initialSelectedOptions: [unmatchedInitialOption],
            areOptionsInitialized: true,
            translate,
        });

        expect(unmatchedResult.at(0)?.data).toEqual([expect.objectContaining({login: 'name-only attendee', isSelected: true})]);
        expect(unmatchedResult.at(1)?.title).toBe('common.recents');
    });
});
