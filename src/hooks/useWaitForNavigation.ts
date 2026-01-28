import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef} from 'react';

type UseWaitForNavigation = (navigate: () => void) => () => Promise<void>;

/**
 * Returns a promise that resolves when navigation finishes.
 * Only use when navigating by react-navigation
 */
export default function useWaitForNavigation(): UseWaitForNavigation {
    const resolvePromises = useRef<Array<() => void>>([]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                for (const resolve of resolvePromises.current) {
                    resolve();
                }
                resolvePromises.current = [];
            };
        }, []),
    );

    return (navigate: () => void) => () => {
        navigate();
        return new Promise<void>((resolve) => {
            resolvePromises.current.push(resolve);
        });
    };
}
