import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SwitchToOldDotOnNonMicroCompanySize from './types';

const switchToOldDotOnNonMicroCompanySize: SwitchToOldDotOnNonMicroCompanySize = (onboardingCompanySize) => {
    if (onboardingCompanySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_TRYNEWDOT,
            value: {
                classicRedirect: {
                    dismissed: true,
                },
            },
        },
    ];

    API.write(WRITE_COMMANDS.SWITCH_TO_OLD_DOT_ON_COMPANY_SIZE, {onboardingCompanySize}, {optimisticData});
};

export default switchToOldDotOnNonMicroCompanySize;
