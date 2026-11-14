import {renderHook} from '@testing-library/react-native';

import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useUserSecurityGroup from '@hooks/useUserSecurityGroup';

jest.mock('@hooks/useUserSecurityGroup', () => jest.fn());

describe('useStrictPolicyRules loading state', () => {
    it.each([true, false])('exposes loading until strict enforcement resolves to %s', (enableStrictPolicyRules) => {
        // Given domain security-group data that has not loaded
        jest.mocked(useUserSecurityGroup).mockReturnValue({securityGroup: undefined, isLoadingSecurityGroup: true});
        const {result, rerender} = renderHook(() => useStrictPolicyRules());
        expect(result.current).toEqual({areStrictPolicyRulesEnabled: false, isLoadingSecurityGroup: true});

        // When the group resolves to its actual enforcement setting
        jest.mocked(useUserSecurityGroup).mockReturnValue({
            securityGroup: {enableStrictPolicyRules, enableRestrictedPrimaryLogin: false, enableRestrictedPolicyCreation: false},
            isLoadingSecurityGroup: false,
        });
        rerender({});

        // Then callers can distinguish confirmed permissions from the unresolved state
        expect(result.current).toEqual({areStrictPolicyRulesEnabled: enableStrictPolicyRules, isLoadingSecurityGroup: false});
    });
});
