import {getEmptyOptions} from '@libs/OptionsListUtils';
import type {Options} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import {buildAddDelegateSections, buildInitialDelegateOption} from '@src/pages/settings/Security/AddDelegate/AddDelegatePageUtils';

function buildOption(overrides: Partial<OptionData> & Pick<OptionData, 'login' | 'keyForList' | 'text'>): OptionData {
    return {
        accountID: overrides.accountID ?? (Number(overrides.keyForList) || 1),
        alternateText: overrides.login,
        ...overrides,
    };
}

const translate = (key: 'common.recents' | 'common.contacts') => key;

describe('AddDelegatePageUtils', () => {
    it('shows the selected delegate in a top section and excludes it from recents and contacts on reopen', () => {
        const selectedOption = buildOption({login: 'selected@test.com', keyForList: '1', text: 'Selected', accountID: 1});
        const recentOption = buildOption({login: 'recent@test.com', keyForList: '2', text: 'Recent', accountID: 2});
        const contactOption = buildOption({login: 'contact@test.com', keyForList: '3', text: 'Contact', accountID: 3});
        const extraRecentOptions = Array.from({length: 4}, (_, index) =>
            buildOption({
                login: `recent${index + 2}@test.com`,
                keyForList: `${index + 4}`,
                text: `Recent ${index + 2}`,
                accountID: index + 4,
            }),
        );
        const extraContactOptions = Array.from({length: 4}, (_, index) =>
            buildOption({
                login: `contact${index + 2}@test.com`,
                keyForList: `${index + 8}`,
                text: `Contact ${index + 2}`,
                accountID: index + 8,
            }),
        );
        const searchOptions: Options = {
            ...getEmptyOptions(),
            personalDetails: [selectedOption, contactOption, ...extraContactOptions],
            recentReports: [selectedOption, recentOption, ...extraRecentOptions],
        };

        const sections = buildAddDelegateSections({
            searchTerm: '',
            searchOptions,
            selectedOptions: [selectedOption],
            initialSelectedOptions: [selectedOption],
            areOptionsInitialized: true,
            translate,
        });

        expect(sections.at(0)?.data).toEqual([expect.objectContaining({login: 'selected@test.com', isSelected: true})]);
        expect(sections.at(1)?.title).toBe('common.recents');
        expect(sections.at(1)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent@test.com'})]));
        expect(sections.at(1)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'selected@test.com'})]));
        expect(sections.at(2)?.title).toBe('common.contacts');
        expect(sections.at(2)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'contact@test.com'})]));
        expect(sections.at(2)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'selected@test.com'})]));
    });

    it('shows an invite-only email in the top section when it exists only in initial selection', () => {
        const inviteOnlyOption = buildOption({login: 'invite@test.com', keyForList: 'invite@test.com', text: 'invite@test.com'});
        const searchOptions: Options = {
            ...getEmptyOptions(),
        };

        const sections = buildAddDelegateSections({
            searchTerm: '',
            searchOptions,
            selectedOptions: [inviteOnlyOption],
            initialSelectedOptions: [inviteOnlyOption],
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(1);
        expect(sections.at(0)?.data).toEqual([expect.objectContaining({login: 'invite@test.com', isSelected: true})]);
    });

    it('hides the top selected section while searching and keeps the matching selected row inline', () => {
        const selectedOption = buildOption({login: 'selected@test.com', keyForList: '1', text: 'Selected', accountID: 1, isSelected: true});
        const searchOptions: Options = {
            ...getEmptyOptions(),
            personalDetails: [selectedOption],
        };

        const sections = buildAddDelegateSections({
            searchTerm: 'selected',
            searchOptions,
            selectedOptions: [selectedOption],
            initialSelectedOptions: [selectedOption],
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(1);
        expect(sections.at(0)?.title).toBe('common.contacts');
        expect(sections.at(0)?.data).toEqual([expect.objectContaining({login: 'selected@test.com', isSelected: true})]);
    });

    it('keeps the selected row inline when the list is at or below the threshold', () => {
        const selectedOption = buildOption({login: 'selected@test.com', keyForList: '1', text: 'Selected', accountID: 1, isSelected: true});
        const recentOptions = Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD}, (_, index) =>
            buildOption({
                login: `recent${index}@test.com`,
                keyForList: `${index + 10}`,
                text: `Recent ${index}`,
                accountID: index + 10,
                isSelected: false,
            }),
        );
        recentOptions[0] = selectedOption;
        const searchOptions: Options = {
            ...getEmptyOptions(),
            recentReports: recentOptions,
        };

        const sections = buildAddDelegateSections({
            searchTerm: '',
            searchOptions,
            selectedOptions: [selectedOption],
            initialSelectedOptions: [selectedOption],
            areOptionsInitialized: true,
            translate,
        });

        expect(sections).toHaveLength(1);
        expect(sections.at(0)?.title).toBe('common.recents');
        expect(sections.at(0)?.data.at(0)).toEqual(expect.objectContaining({login: 'selected@test.com', isSelected: true}));
    });

    it('builds an initial selected delegate option for reopen state', () => {
        const options = buildInitialDelegateOption('selected@test.com');

        expect(options).toEqual([expect.objectContaining({login: 'selected@test.com', selected: true})]);
    });
});
