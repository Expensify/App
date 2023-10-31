import {useNavigation} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

/**
 * Returns a promise that resolves when navigation finishes.
 * Only use when navigating by react-navigation
 *
 * @returns {function}
 */
export default function useWaitForNavigation() {
    const navigation = useNavigation();
    const resolvePromises = useRef([]);

    useEffect(() => {
        const unsubscribeBlur = navigation.addListener('blur', () => {
            resolvePromises.current.forEach((resolve) => {
                resolve();
            });
            resolvePromises.current = [];
        });

        return () => {
            unsubscribeBlur();
        };
    }, [navigation]);

    return (navigate) => () => {
        navigate();
        return new Promise((resolve) => {
            resolvePromises.current.push(resolve);
        });
    };
}
