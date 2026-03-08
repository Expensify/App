import type {SearchOptionData} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import {areRoomInviteSelectionsEqual, areSameRoomInviteOption, rehydrateRoomInviteSelectedOptions} from '@pages/RoomInvitePageUtils';

function createOption(keyForList: string, overrides: Partial<OptionData> = {}): OptionData {
    return {
        keyForList,
        text: keyForList,
        login: `${keyForList}@example.com`,
        isSelected: true,
        selected: true,
        ...overrides,
    };
}

function createSearchOption(keyForList: string, overrides: Partial<SearchOptionData> = {}): SearchOptionData {
    return {
        keyForList,
        text: keyForList,
        login: `${keyForList}@example.com`,
        isSelected: false,
        ...overrides,
    };
}

describe('RoomInvitePageUtils', () => {
    it('matches room invite options semantically even when keyForList changes', () => {
        expect(areSameRoomInviteOption(createOption('login-key', {accountID: 123, login: 'same@example.com'}), createOption('123', {accountID: 123, login: 'same@example.com'}))).toBe(true);
    });

    it('treats semantically equal selections as equal even when object references differ', () => {
        const left = [createOption('login-key', {accountID: 123, login: 'same@example.com'})];
        const right = [createOption('123', {accountID: 123, login: 'same@example.com'})];

        expect(areRoomInviteSelectionsEqual(left, right)).toBe(true);
    });

    it('rehydrates selected options from the latest invite personal details without changing semantic identity', () => {
        const selectedOptions = [createOption('stale-key', {accountID: 123, login: 'same@example.com', text: 'Stale Name'})];
        const invitePersonalDetails = [createSearchOption('123', {accountID: 123, login: 'same@example.com', text: 'Fresh Name', alternateText: 'same@example.com'})];

        const hydratedOptions = rehydrateRoomInviteSelectedOptions(selectedOptions, invitePersonalDetails);

        expect(hydratedOptions).toHaveLength(1);
        expect(hydratedOptions.at(0)?.keyForList).toBe('123');
        expect(hydratedOptions.at(0)?.text).toBe('Fresh Name');
        expect(areRoomInviteSelectionsEqual(selectedOptions, hydratedOptions)).toBe(true);
    });
});
