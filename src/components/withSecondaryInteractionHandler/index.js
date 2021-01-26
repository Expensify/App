/**
 * This is a higher order component that wraps an element in a pressable, and calls onSecondaryInteraction when that
 * pressable is long pressed, or right clicked.
 */
import React from 'react';
import {Pressable} from 'react-native';
import getComponentDisplayName from '../../libs/getComponentDisplayName';

export default function (onSecondaryInteraction) {
    function onContextMenu(e) {
        // Preventing the context menu from opening
        e.preventDefault();
        onSecondaryInteraction();
    }

    return (WrappedComponent) => {
        class withSecondaryInteractionHandler extends React.Component {
            constructor(props) {
                super(props);

                this.pressableRef = React.createRef();
            }

            componentDidMount() {
                this.pressableRef.current.addEventListener('contextmenu', onContextMenu);
            }

            render() {
                return (
                    <Pressable
                        onLongPress={onSecondaryInteraction}
                        ref={this.pressableRef}
                    >
                        <WrappedComponent
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...this.props}
                        />
                    </Pressable>
                );
            }
        }

        withSecondaryInteractionHandler
            .displayName = `withSecondaryInteractionHandler(${getComponentDisplayName(WrappedComponent)})`;
        return withSecondaryInteractionHandler;
    };
}
