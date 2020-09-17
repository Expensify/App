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

                this.state = {
                    itemsToRender: null,
                };
            }

            componentDidMount() {
                _.each(batches(this.props), (batch) => {
                    setTimeout(() => {
                        this.setState({
                            itemsToRender: batch.items,
                        });
                    }, batch.delay || 0);
                });
            }

            componentDidUpdate(prevProps) {
                if (_.size(prevProps[propNameToBatch]) !== _.size(this.props[propNameToBatch])) {
                    this.setState({
                        itemsToRender: this.props[propNameToBatch],
                    });
                }
            }

            render() {
                // Spreading props and state is necessary in an HOC where the data cannot be predicted
                return (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...this.props}
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
