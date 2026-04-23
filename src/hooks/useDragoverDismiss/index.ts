import {useEffect} from 'react';

function useDragoverDismiss(isActive: boolean, dismiss: () => void) {
    useEffect(() => {
        if (!isActive) {
            return;
        }
        const handler = () => {
            dismiss();
            document.removeEventListener('dragover', handler);
        };
        document.addEventListener('dragover', handler);
        return () => document.removeEventListener('dragover', handler);
    }, [isActive, dismiss]);
}

export default useDragoverDismiss;
