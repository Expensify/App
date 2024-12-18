import {renderHook} from '@testing-library/react-native';
import useFastSearchFromOptions from '@hooks/useFastSearchFromOptions';
import type {Options} from '@libs/OptionsListUtils';

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
                    text: 'Ahntony',
                },
            ],
        } as Options;
        const {result} = renderHook(() => useFastSearchFromOptions(options));
        const search = result.current;

        const {personalDetails, recentReports} = search('Ah Ga');

        expect(personalDetails).toEqual([expect.objectContaining({text: 'Ahmed Gaber'})]);
        expect(recentReports).toEqual([{text: 'Ahmed Gaber (Report)'}]);
    });
});
