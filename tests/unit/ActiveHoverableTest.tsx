import {fireEvent, render, screen} from '@testing-library/react-native';

import ActiveHoverable from '@components/Hoverable/ActiveHoverable';

import React from 'react';
import {View} from 'react-native';

describe('ActiveHoverable', () => {
    it('should keep the child props and refs while adding hover handling', () => {
        // Given a child with its own ref and mouse handler, and a ref passed to the hoverable
        let childElement: View | null = null;
        const hoverableRef = React.createRef<HTMLElement>();
        const onChildMouseEnter = jest.fn();
        const onHoverIn = jest.fn();
        render(
            <ActiveHoverable
                ref={hoverableRef}
                onHoverIn={onHoverIn}
            >
                {(isHovered) => (
                    <View
                        ref={(element: View | null) => {
                            childElement = element;
                        }}
                        testID={isHovered ? 'hovered' : 'idle'}
                        accessibilityLabel="Row"
                        onMouseEnter={onChildMouseEnter}
                    />
                )}
            </ActiveHoverable>,
        );

        // When the pointer enters the child
        fireEvent(screen.getByTestId('idle'), 'mouseEnter', {});

        // Then the hover state reaches the child, both refs point at it, and the child's own handler still runs
        const hoveredChild = screen.getByTestId('hovered');
        expect(hoveredChild.props.accessibilityLabel).toBe('Row');
        expect(onHoverIn).toHaveBeenCalledTimes(1);
        expect(onChildMouseEnter).toHaveBeenCalledTimes(1);
        expect(childElement).not.toBeNull();
        expect(hoverableRef.current).toBe(childElement);
    });
});
