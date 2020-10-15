/**
 * This HOC is used to incrementally display a collection of data in batches.
 * Example: in MainView.js only the visible reports should be rendered in the first batch,
 * then all other reports are rendered in the second batch
 */
import React from 'react';
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
        class withBatchedRendering extends React.Component {
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
                if (_.size(prevProps[propNameToBatch]) !== _.size(this.props[propNameToBatch])) {
                    this.setItemsToRender(this.props[propNameToBatch]);
                }
            }

            componentWillUnmount() {
                _.each(this.timers, timerID => clearTimeout(timerID));
            }

            /**
             * Sets items to the state key that matches the defined propNameToBatch
             *
             * @param {*} items
             */
            setItemsToRender(items) {
                this.setState({
                    [propNameToBatch]: items,
                });
            }

            render() {
                const propsToPass = _.omit(this.props, propNameToBatch);

                // Spreading props and state is necessary in an HOC where the data cannot be predicted
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
