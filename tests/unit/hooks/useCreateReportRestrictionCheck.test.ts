import {renderHook} from '@testing-library/react-native';

import useCreateReportRestrictionCheck from '@pages/iou/request/step/IOURequestStepReport/hooks/useCreateReportRestrictionCheck';

import type * as OnyxTypes from '@src/types/onyx';

import createMock from '../../utils/createMock';

const mockShouldRestrict = jest.fn<boolean, unknown[]>();

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldRestrictUserBillableActions: (...args: unknown[]): boolean => mockShouldRestrict(...args),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => {
        if (key === 'sharedNVP_private_billingGracePeriodEnd_') {
            return [{end: 123}];
        }
        if (key === 'nvp_private_billingGracePeriodEnd') {
            return [456];
        }
        if (key === 'nvp_private_amountOwed') {
            return [789];
        }
        return [undefined];
    },
}));

const session = createMock<OnyxTypes.Session>({accountID: 42});
const restrictedPolicy = createMock<OnyxTypes.Policy>({id: 'p1'});

describe('useCreateReportRestrictionCheck', () => {
    beforeEach(() => {
        mockShouldRestrict.mockReset();
    });

    it('returns false when no restriction policy is supplied (skip the subscription check)', () => {
        mockShouldRestrict.mockReturnValue(true);
        const {result} = renderHook(() => useCreateReportRestrictionCheck(session));

        expect(result.current(undefined)).toBe(false);
        expect(mockShouldRestrict).not.toHaveBeenCalled();
    });

    it('forwards billing/grace-period state and accountID to shouldRestrictUserBillableActions', () => {
        mockShouldRestrict.mockReturnValue(true);
        const {result} = renderHook(() => useCreateReportRestrictionCheck(session));

        expect(result.current(restrictedPolicy)).toBe(true);
        expect(mockShouldRestrict).toHaveBeenCalledWith(restrictedPolicy, expect.anything(), expect.anything(), expect.anything(), 42);
    });

    it('returns whatever shouldRestrictUserBillableActions returns', () => {
        mockShouldRestrict.mockReturnValue(false);
        const {result} = renderHook(() => useCreateReportRestrictionCheck(session));

        expect(result.current(restrictedPolicy)).toBe(false);
    });
});
