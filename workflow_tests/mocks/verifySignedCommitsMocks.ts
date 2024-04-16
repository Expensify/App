/* eslint-disable @typescript-eslint/naming-convention */
import {createMockStep} from '../utils/utils';

// verifysignedcommits
const VERIFYSIGNEDCOMMITS__VERIFYSIGNEDCOMMITS__VERIFY_SIGNED_COMMITS__STEP_MOCK = createMockStep(
    'Verify signed commits',
    'Verify signed commits',
    'VERIFYSIGNEDCOMMITS',
    ['GITHUB_TOKEN'],
    [],
);
const VERIFYSIGNEDCOMMITS__VERIFYSIGNEDCOMMITS__STEP_MOCKS = [VERIFYSIGNEDCOMMITS__VERIFYSIGNEDCOMMITS__VERIFY_SIGNED_COMMITS__STEP_MOCK];

export default {
    VERIFYSIGNEDCOMMITS__VERIFYSIGNEDCOMMITS__STEP_MOCKS,
};
