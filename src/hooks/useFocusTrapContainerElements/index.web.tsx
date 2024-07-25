import {useCallback, useState} from 'react';
import type {FocusTrapContainerElement, UseFocusTrapContainerElements} from './type';

const useFocusTrapContainerElements: UseFocusTrapContainerElements = () => {
    const [containers, setContainers] = useState<HTMLElement[]>([]);

    const addContainer = useCallback((container: FocusTrapContainerElement) => {
        const containerAsHTMLElement = container as unknown as HTMLElement;
        const removeContainer = () => setContainers((prevContainers) => prevContainers.filter((c) => c !== container));
        setContainers((prevContainers) => (prevContainers.includes(containerAsHTMLElement) ? prevContainers : [...prevContainers, containerAsHTMLElement]));

        return removeContainer;
    }, []);

    return [containers, addContainer];
};

export default useFocusTrapContainerElements;
