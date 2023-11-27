import { useEffect } from "react";

type UseWindowFocusEventCallback = (event: FocusEvent) => void
export type {UseWindowFocusEventCallback}

export default function useWindowFocusEvent(callback: UseWindowFocusEventCallback) {
    useEffect(() => {
        window.addEventListener('focus', callback);

        return () => {
            window.removeEventListener('focus', callback);
        }
    }, [callback])
}
