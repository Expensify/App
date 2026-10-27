import {handleWiseFlowMessage, handleWiseRedirect} from '@components/EmbeddedWisePage/wiseFlowMessages';

function createCallbacks() {
    return {
        onReady: jest.fn(),
        onDone: jest.fn(),
        onCancel: jest.fn(),
        onError: jest.fn(),
    };
}

describe('handleWiseFlowMessage', () => {
    it('calls onReady for a ready message posted as an object, as web receives it', () => {
        // Given the callbacks of an open Wise page
        const callbacks = createCallbacks();

        // When Wise's iframe posts that it is ready
        handleWiseFlowMessage({type: 'ready'}, callbacks);

        // Then only onReady runs, so the loader hides
        expect(callbacks.onReady).toHaveBeenCalledTimes(1);
        expect(callbacks.onDone).not.toHaveBeenCalled();
        expect(callbacks.onCancel).not.toHaveBeenCalled();
        expect(callbacks.onError).not.toHaveBeenCalled();
    });

    it('calls onDone for a done message posted as a JSON string, as the native bridge forwards it', () => {
        // Given the callbacks of an open Wise page
        const callbacks = createCallbacks();

        // When the native bridge forwards Wise's done message with the review ID
        handleWiseFlowMessage(JSON.stringify({type: 'done', kycReviewId: 'b3f1c2d4-0000-4000-8000-000000000000'}), callbacks);

        // Then onDone runs, so the page closes
        expect(callbacks.onDone).toHaveBeenCalledTimes(1);
    });

    it('treats an error with the cancelled code as a cancel, not a failure', () => {
        // Given the callbacks of an open Wise page
        const callbacks = createCallbacks();

        // When the user closes Wise's flow, which Wise reports as an error with code cancelled
        handleWiseFlowMessage({type: 'error', code: 'cancelled'}, callbacks);

        // Then the page closes quietly instead of offering a retry
        expect(callbacks.onCancel).toHaveBeenCalledTimes(1);
        expect(callbacks.onError).not.toHaveBeenCalled();
    });

    it('treats any other error as a failure', () => {
        // Given the callbacks of an open Wise page
        const callbacks = createCallbacks();

        // When Wise's page reports it cannot continue
        handleWiseFlowMessage({type: 'error', code: 'expired'}, callbacks);

        // Then onError runs, so the user can retry with a new link
        expect(callbacks.onError).toHaveBeenCalledTimes(1);
        expect(callbacks.onCancel).not.toHaveBeenCalled();
    });

    it('ignores resize messages, malformed JSON and data without a type', () => {
        // Given the callbacks of an open Wise page
        const callbacks = createCallbacks();

        // When messages arrive that are not a flow event we act on
        handleWiseFlowMessage({type: 'resize', height: 800}, callbacks);
        handleWiseFlowMessage('{not json', callbacks);
        handleWiseFlowMessage({height: 800}, callbacks);
        handleWiseFlowMessage(null, callbacks);

        // Then no callback runs, because the page fills the screen and other data is not Wise's
        expect(callbacks.onReady).not.toHaveBeenCalled();
        expect(callbacks.onDone).not.toHaveBeenCalled();
        expect(callbacks.onCancel).not.toHaveBeenCalled();
        expect(callbacks.onError).not.toHaveBeenCalled();
    });
});

describe('handleWiseRedirect', () => {
    it('maps each redirect status to its callback and reports the URL as handled', () => {
        // Given the callbacks of an open Wise page
        const callbacks = createCallbacks();

        // When Wise redirects to our landing path with each status
        const results = [
            handleWiseRedirect('https://new.expensify.com/wise-kyc-complete?status=success&kycReviewId=b3f1c2d4', callbacks),
            handleWiseRedirect('https://staging.new.expensify.com/wise-kyc-complete?kycReviewId=b3f1c2d4&status=cancelled', callbacks),
            handleWiseRedirect('https://new.expensify.com/wise-kyc-complete?status=error', callbacks),
        ];

        // Then each status runs the matching callback and the WebView is told to stop loading
        expect(results).toEqual([true, true, true]);
        expect(callbacks.onDone).toHaveBeenCalledTimes(1);
        expect(callbacks.onCancel).toHaveBeenCalledTimes(1);
        expect(callbacks.onError).toHaveBeenCalledTimes(1);
    });

    it('leaves other URLs alone', () => {
        // Given the callbacks of an open Wise page
        const callbacks = createCallbacks();

        // When the WebView navigates within Wise's page
        const isHandled = handleWiseRedirect('https://wise.com/embedded-flows/kyc-review#token=abc', callbacks);

        // Then the navigation goes ahead and no callback runs
        expect(isHandled).toBe(false);
        expect(callbacks.onDone).not.toHaveBeenCalled();
        expect(callbacks.onCancel).not.toHaveBeenCalled();
        expect(callbacks.onError).not.toHaveBeenCalled();
    });
});
