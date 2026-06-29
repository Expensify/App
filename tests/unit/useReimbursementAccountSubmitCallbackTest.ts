import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReimbursementAccountSubmitCallback from '@hooks/useReimbursementAccountSubmitCallback';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('useReimbursementAccountSubmitCallback', () => {
    beforeEach(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('calls onSubmit once the submit succeeds (loading clears with no errors)', async () => {
        const onSubmit = jest.fn();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true});
        });

        const {result} = renderHook(() => useReimbursementAccountSubmitCallback(onSubmit));

        act(() => {
            result.current();
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false});
        });
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when the submit fails, even after the error later clears', async () => {
        const onSubmit = jest.fn();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true});
        });

        const {result} = renderHook(() => useReimbursementAccountSubmitCallback(onSubmit));

        act(() => {
            result.current();
        });

        // API call finishes with an error - we must stay on the page.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false, errors: {error: 'Something failed'}});
        });
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).not.toHaveBeenCalled();

        // The error is later cleared (e.g. the user interacts with the form). Navigation must remain disarmed.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors: null});
        });
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when loading clears without the submit being armed', async () => {
        const onSubmit = jest.fn();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: true});
        });

        renderHook(() => useReimbursementAccountSubmitCallback(onSubmit));

        await act(async () => {
            await Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isLoading: false});
        });
        await waitForBatchedUpdatesWithAct();

        expect(onSubmit).not.toHaveBeenCalled();
    });
});
