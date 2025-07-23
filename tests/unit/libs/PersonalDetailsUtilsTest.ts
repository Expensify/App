import Onyx from 'react-native-onyx';
import {getEffectiveDisplayName} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import {formatPhoneNumber} from '../../utils/TestHelper';

describe('PersonalDetailsUtils', () => {
    beforeAll(() => {
        Onyx.merge(ONYXKEYS.COUNTRY_CODE, 1);
    });

    test('should return undefined when personalDetail is undefined', () => {
        const result = getEffectiveDisplayName(formatPhoneNumber, undefined);
        expect(result).toBeUndefined();
    });

    test('should return undefined when personalDetail has neither login nor displayName', () => {
        const personalDetail: PersonalDetails = {accountID: 123};
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBeUndefined();
        expect(result).toBe(undefined);
    });

    test('should return displayName when login is empty or null but displayName exists', () => {
        const personalDetail1: PersonalDetails = {accountID: 123, displayName: 'John Doe', login: ''};
        const personalDetail2: PersonalDetails = {accountID: 456, displayName: 'Jane Smith', login: null as unknown as string}; // Simulate null login

        let result = getEffectiveDisplayName(formatPhoneNumber, personalDetail1);
        expect(result).toBe('John Doe');

        result = getEffectiveDisplayName(formatPhoneNumber, personalDetail2);
        expect(result).toBe('Jane Smith');
    });

    test('should return login (email) when only login exists (not a phone number)', () => {
        const personalDetail: PersonalDetails = {accountID: 123, login: 'john.doe@example.com'};
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('john.doe@example.com');
    });

    test('should return national format for phone login if from the same region (US)', () => {
        const personalDetail: PersonalDetails = {accountID: 123, login: '+15551234567'};
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('+1 555-123-4567');
    });

    test('should return international format for phone login if from a different region (GB)', () => {
        const personalDetail: PersonalDetails = {accountID: 123, login: '+442079460000'};
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('+44 20 7946 0000');
    });

    test('should return formatted login (email) when both login and displayName exist (login takes precedence)', () => {
        const personalDetail: PersonalDetails = {
            accountID: 123,
            login: 'john.doe@example.com',
            displayName: 'John Doe Full Name',
        };
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('john.doe@example.com');
    });

    test('should return formatted login (phone) when both login (same region) and displayName exist', () => {
        const personalDetail: PersonalDetails = {
            accountID: 123,
            login: '+15551234567',
            displayName: 'John Doe Full Name',
        };
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('+1 555-123-4567');
    });

    test('should return formatted login (phone) when both login (different region) and displayName exist', () => {
        const personalDetail: PersonalDetails = {
            accountID: 123,
            login: '+442079460000',
            displayName: 'Jane Smith Full Name',
        };
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('+44 20 7946 0000');
    });

    test('should correctly handle login with SMS domain', () => {
        const personalDetail: PersonalDetails = {
            accountID: 123,
            login: `+18005550000`,
            displayName: 'SMS User',
        };
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('(800) 555-0000');
    });

    test('should fall back to displayName if formatted login is an empty string and displayName exists', () => {
        const personalDetail: PersonalDetails = {accountID: 123, login: '', displayName: 'Fallback Name'};
        const result = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        expect(result).toBe('Fallback Name');
    });
});
