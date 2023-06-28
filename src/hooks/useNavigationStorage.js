import {useEffect} from 'react';

const storage = new Map();

/**
 * Clears the navigation storage, call it before to navigate to a new page
 */
function clearNavigationStorage() {
    storage.clear();
}

/**
 * Saves a value into the navigation storage. Use it for class components
 * @param {String} key
 * @param {any} value
 */
function saveIntoStorage(key, value) {
    storage.set(key, value);
}

export default function useNavigationStorage(key = 'input', initialValue = null) {
    useEffect(() => {
        if (!initialValue || storage.has(key)) {
            return;
        }
        storage.set(key, initialValue);
    }, [key, initialValue]);

    const collect = () => storage.get(key);
    const save = (value) => {
        storage.set(key, value);
    };

    return [collect, save];
}

export {clearNavigationStorage, saveIntoStorage};
