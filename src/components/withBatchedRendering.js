/**
 * This HOC is used to incrementally display a collection of data in batches.
 * Example: in MainView.js only the visible reports should be rendered in the first batch,
 * then all other reports are rendered in the second batch
 */
import React, {Component} from 'react';
import _ from 'underscore';

/**
 * Returns the display name of a component
 *
 * @param {object} component
 * @returns {string}
 */
function getDisplayName(component) {
    return component.displayName || component.name || 'Component';
}

export default function (propNameToBatch, batches) {
    return (WrappedComponent) => {
        class withBatchedRendering extends Component {
            constructor(props) {
                super(props);
                this.timers = [];
                this.state = {};
            }

            componentDidMount() {
                _.each(batches, (batch) => {
                    this.timers.push(
                        setTimeout(() => {
                            this.setItemsToRender(batch.items(this.props));
                        }, batch.delay || 0)
                    );
                });
            }

            componentDidUpdate(prevProps) {
                // We need this to allow the flow of props down from a parent component
                // to work normally after all the batches have finished rendering
                if (_.size(prevProps[propNameToBatch]) !== _.size(this.props[propNameToBatch])) {
                    this.setItemsToRender(this.props[propNameToBatch]);
                }
            }

            componentWillUnmount() {
                // We need to clean up any timers when the component unmounts or else
                // we'll call set state on an unmounting component.
                this.cancelBatchTimers()
            }

            /**
             * Sets items to the state key that matches the defined propNameToBatch
             *
             * @param {Object|Array} items - typically a collection of some kind
             */
            setItemsToRender(items) {
                this.setState({
                    [propNameToBatch]: items,
                });
            }

            /**
             * Cancels all the timers
             */
            cancelBatchTimers() {
                _.each(this.timers, timerID => clearTimeout(timerID));
            }

            render() {
                // We must remove the original prop that we are splitting into chunks
                // since we only want our processed versions to be passed as a prop.
                const propsToPass = _.omit(this.props, propNameToBatch);
                return (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...propsToPass}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...this.state}
                    />
                );
            }
        }

        withBatchedRendering.displayName = `withBatchedRendering(${getDisplayName(WrappedComponent)})`;
        return withBatchedRendering;
    };
}
