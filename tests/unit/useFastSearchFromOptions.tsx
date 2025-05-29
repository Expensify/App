import {renderHook} from '@testing-library/react-native';
import useFastSearchFromOptions from '@hooks/useFastSearchFromOptions';
import type {Options} from '@libs/OptionsListUtils';

const nonLatinOptions = {
    currentUserOption: null,
    userToInvite: null,
    personalDetails: [
        {
            text: 'Fábio John',
            participantsList: [
                {
                    displayName: 'Fábio John',
                },
            ],
        },
    ],
    recentReports: [
        {
            text: 'Fábio, John (Report)',
        },
    ],
} as Options;

describe('useFastSearchFromOptions', () => {
    it('should return sub word matches', () => {
        const options = {
            currentUserOption: null,
            userToInvite: null,
            personalDetails: [
                {
                    text: 'Ahmed Gaber',
                    participantsList: [
                        {
                            displayName: 'Ahmed Gaber',
                        },
                    ],
                },
                {
                    text: 'Banana',
                    participantsList: [
                        {
                            displayName: 'Banana',
                        },
                    ],
                },
            ],
            recentReports: [
                {
                    text: 'Ahmed Gaber (Report)',
                },
                {
                    text: 'Something else',
                },
                {
                    // This starts with Ah as well, but should not match
                    text: 'Aha',
                },
            ],
        } as Options;
        const {result} = renderHook(() => useFastSearchFromOptions(options));
        const search = result.current;

        const {personalDetails, recentReports} = search('Ah Ga');

        expect(personalDetails).toEqual([expect.objectContaining({text: 'Ahmed Gaber'})]);
        expect(recentReports).toEqual([{text: 'Ahmed Gaber (Report)'}]);
    });
    it('should return reports/personalDetails with non-latin characters', () => {
        const {result} = renderHook(() => useFastSearchFromOptions(nonLatinOptions));
        const search = result.current;

        const {personalDetails, recentReports} = search('Fabio');

        expect(personalDetails).toEqual([expect.objectContaining({text: 'Fábio John'})]);
        expect(recentReports).toEqual([{text: 'Fábio, John (Report)'}]);
    });
    it('should return reports/personalDetails with multiple word query and non-latin character', () => {
        const {result} = renderHook(() => useFastSearchFromOptions(nonLatinOptions));
        const search = result.current;

        const {recentReports, personalDetails} = search('John Fabio');

        expect(personalDetails).toEqual([expect.objectContaining({text: 'Fábio John'})]);
        expect(recentReports).toEqual([{text: 'Fábio, John (Report)'}]);
    });
});
