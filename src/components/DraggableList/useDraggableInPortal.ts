import {useEffect, useRef} from 'react';
import type {DraggableChildrenFn} from 'react-beautiful-dnd';
import {createPortal} from 'react-dom';

type DraggableInPortal = {
    shouldUsePortal?: boolean;
};

export default function useDraggableInPortal({shouldUsePortal}: DraggableInPortal): (render: DraggableChildrenFn) => DraggableChildrenFn {
    // eslint-disable-next-line react-compiler/react-compiler
    const element = useRef<HTMLDivElement>(document.createElement('div')).current;

    useEffect(() => {
        if (!shouldUsePortal || !element) {
            return;
        }
        element.style.pointerEvents = 'none';
        element.style.position = 'absolute';
        element.style.height = '100%';
        element.style.width = '100%';
        element.style.top = '0';

        document.body.appendChild(element);

        return () => {
            document.body.removeChild(element);
        };
    }, [element, shouldUsePortal]);

    if (!shouldUsePortal) {
        return (render) => render;
    }

    return (render): DraggableChildrenFn =>
        (provided, snapshot, rubric) => {
            const result = render(provided, snapshot, rubric);
            const style = provided.draggableProps.style;
            if (style && 'position' in style && style.position === 'fixed') {
                return createPortal(result, element);
            }
            return result;
        };
}

export type {DraggableInPortal};
