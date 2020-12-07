/**
 * This is a higher order component that wraps an element in a pressable, and calls onSecondaryInteraction when that
 * pressable is long pressed, or right clicked.
 */
import React from 'react';
import {Pressable, TouchableOpacity} from 'react-native';

export default function (onSecondaryInteraction) {

    function onContextMenu(e) {
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
                            {...this.props}
                        />
                    </Pressable>
                )
            }
        }

        return withSecondaryInteractionHandler;
    };
};
