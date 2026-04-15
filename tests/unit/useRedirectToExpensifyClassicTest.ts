import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockShowConfirmModal = jest.fn().mockResolvedValue({action: 'CANCEL'});

jest.mock('@hooks/useConfirmModal', () => {
    return jest.fn().mockImplementation(() => ({
        showConfirmModal: mockShowConfirmModal,
    }));
});

jest.mock('@hooks/useLocalize', () => {
    return jest.fn().mockImplementation(() => ({
        translate: (key: string) => key,
    }));
});

function mockHybridAppConfig(isHybridApp: boolean): () => void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const CONFIG = require('@src/CONFIG');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const originalValue = CONFIG.default.IS_HYBRID_APP;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    CONFIG.default.IS_HYBRID_APP = isHybridApp;

    return () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        CONFIG.default.IS_HYBRID_APP = originalValue;
    };
}

function buildPaidGroupPolicy(id: number): Policy {
    return {
        ...createRandomPolicy(id, CONST.POLICY.TYPE.CORPORATE),
        id: id.toString(),
        role: CONST.POLICY.ROLE.USER,
        pendingAction: null,
        isJoinRequestPending: false,
        isPolicyExpenseChatEnabled: false,
    };
}

describe('useRedirectToExpensifyClassic', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('blocks the FAB Classic redirect when HybridApp users are locked to NewApp', async () => {
        const cleanup = mockHybridAppConfig(true);

        try {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPaidGroupPolicy(1));
            await Onyx.set(ONYXKEYS.NVP_TRY_NEW_DOT, {
                isLockedToNewApp: true,
            });
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useRedirectToExpensifyClassic());

            await waitFor(() => {
                expect(result.current.shouldRedirectToExpensifyClassic).toBe(true);
                expect(result.current.canRedirectToExpensifyClassic).toBe(false);
                expect(result.current.canUseAction).toBe(false);
            });

            await act(async () => {
                await result.current.showRedirectToExpensifyClassicModal();
            });

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        } finally {
            cleanup();
        }
    });

    it('still allows the FAB Classic redirect when HybridApp users are not locked', async () => {
        const cleanup = mockHybridAppConfig(true);

        try {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, buildPaidGroupPolicy(1));
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useRedirectToExpensifyClassic());

            await waitFor(() => {
                expect(result.current.shouldRedirectToExpensifyClassic).toBe(true);
                expect(result.current.canRedirectToExpensifyClassic).toBe(true);
                expect(result.current.canUseAction).toBe(true);
            });

            await act(async () => {
                await result.current.showRedirectToExpensifyClassicModal();
            });

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        } finally {
            cleanup();
        }
    });
});
