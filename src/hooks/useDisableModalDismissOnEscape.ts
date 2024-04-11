import * as Modal from '@userActions/Modal';
import { useEffect } from "react";

export default function useDisableModalDismissOnEscape() {
    useEffect(() => {
        Modal.setDisableDismissOnEscape(true);
        return () => Modal.setDisableDismissOnEscape(false);
    }, []);
}