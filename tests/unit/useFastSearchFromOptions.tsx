import {renderHook} from '@testing-library/react-native';
import useFastSearchFromOptions from '@hooks/useFastSearchFromOptions';
import type {Options} from '@libs/OptionsListUtils';

const ahmedPersonalDetail = {
    login: 'ahmed@example.com',
    text: 'Ahmed Gaber',
    participantsList: [
        {
            displayName: 'Ahmed Gaber',
        },
    ],
};

const ahmedReport = {
    reportID: '1',
    text: 'Ahmed Gaber (Report)',
};

const fabioPersonalDetail = {
    login: 'fabio.john@example.com',
    text: 'Fábio John',
    participantsList: [
        {
            displayName: 'Fábio John',
        },
    ],
};

const fabioReport = {
    reportID: '4',
    text: 'Fábio, John (Report)',
};

const options = {
    currentUserOption: null,
    userToInvite: null,
    personalDetails: [
        ahmedPersonalDetail,
        {
            login: 'banana@example.com',
            text: 'Banana',
            participantsList: [
                {
                    displayName: 'Banana',
                },
            ],
        },
    ],
    recentReports: [
        ahmedReport,
        {
            reportID: '2',
            text: 'Something else',
        },
        {
            reportID: '3',
            // This starts with Ah as well, but should not match
            text: 'Aha',
        },
    ],
} as Options;

const nonLatinOptions = {
    currentUserOption: null,
    userToInvite: null,
    personalDetails: [fabioPersonalDetail],
    recentReports: [fabioReport],
} as Options;

describe('useFastSearchFromOptions', () => {
    it('should return sub word matches', () => {
        const {result} = renderHook(() => useFastSearchFromOptions(options));
        const search = result.current;

        const {personalDetails, recentReports} = search('Ah Ga');

        expect(personalDetails).toEqual([ahmedPersonalDetail]);
        expect(recentReports).toEqual([ahmedReport]);
    });
    it('should return reports/personalDetails with non-latin characters', () => {
        const {result} = renderHook(() => useFastSearchFromOptions(nonLatinOptions));
        const search = result.current;

        const {personalDetails, recentReports} = search('Fabio');

        expect(personalDetails).toEqual([fabioPersonalDetail]);
        expect(recentReports).toEqual([fabioReport]);
    });
    it('should return reports/personalDetails with multiple word query and non-latin character', () => {
        const {result} = renderHook(() => useFastSearchFromOptions(nonLatinOptions));
        const search = result.current;

        const {recentReports, personalDetails} = search('John Fabio');

        expect(personalDetails).toEqual([fabioPersonalDetail]);
        expect(recentReports).toEqual([fabioReport]);
    });
});
