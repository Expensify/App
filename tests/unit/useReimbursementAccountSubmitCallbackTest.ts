import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReimbursementAccountSubmitCallback from '@hooks/useReimbursementAccountSubmitCallback';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('useReimbursementAccountSubmitCallback', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('calls onSubmit once an armed reimbursement account submit finishes without errors', async () => {
        const onSubmit = jest.fn();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true});
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useReimbursementAccountSubmitCallback(onSubmit));
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current();
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false});
            await waitForBatchedUpdatesWithAct();
        });

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when an errored submit is later cleared without another submit', async () => {
        const onSubmit = jest.fn();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true});
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useReimbursementAccountSubmitCallback(onSubmit));
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current();
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false, errors: {error: 'Something went wrong'}});
            await waitForBatchedUpdatesWithAct();
        });

        expect(onSubmit).not.toHaveBeenCalled();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors: null});
            await waitForBatchedUpdatesWithAct();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when loading clears without an armed submit', async () => {
        const onSubmit = jest.fn();

        renderHook(() => useReimbursementAccountSubmitCallback(onSubmit));
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false});
            await waitForBatchedUpdatesWithAct();
        });

        expect(onSubmit).not.toHaveBeenCalled();
    });
});
