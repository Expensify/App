import {useEffect} from 'react';
import * as Modal from '@userActions/Modal';

export default function useDisableModalDismissOnEscape() {
    useEffect(() => {
        Modal.setDisableDismissOnEscape(true);
        return () => Modal.setDisableDismissOnEscape(false);
    }, []);
}
