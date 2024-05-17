/* eslint-disable @typescript-eslint/naming-convention */
import {createMockStep} from '../utils/utils';

// verify
const VERIFYPODFILE__VERIFY__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checkout', 'VERIFY');
const VERIFYPODFILE__VERIFY__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setup Node', 'VERIFY', [], []);
const VERIFYPODFILE__VERIFY__VERIFY_PODFILE__STEP_MOCK = createMockStep('Verify podfile', 'Verify podfile', 'VERIFY', [], []);
const VERIFYPODFILE__VERIFY__STEP_MOCKS = [VERIFYPODFILE__VERIFY__CHECKOUT__STEP_MOCK, VERIFYPODFILE__VERIFY__SETUP_NODE__STEP_MOCK, VERIFYPODFILE__VERIFY__VERIFY_PODFILE__STEP_MOCK];

export default {
    VERIFYPODFILE__VERIFY__STEP_MOCKS,
};
