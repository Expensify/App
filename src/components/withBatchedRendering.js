/**
 * This HOC is used to incrementally display a collection of data in batches.
 * Example: in MainView.js only the visible reports should be rendered in the first batch,
 * then all other reports are rendered in the second batch
 */
import React from 'react';

/**
 * Returns the display name of a component
 *
 * @param {object} component
 * @returns {string}
 */
function getDisplayName(component) {
    return component.displayName || component.name || 'Component';
}

export default function (batchCallback, batchesToRender = 2, batchRenderDelay = 5000) {
    return (WrappedComponent) => {
        class withBatchedRendering extends React.Component {
            constructor(props) {
                super(props);

                this.batchesRendered = 0;

                this.state = {
                    itemsToRender: null,
                };
            }

            componentDidUpdate() {
                if (this.batchesRendered < batchesToRender) {
                    const renderDelay = this.batchesRendered === 0
                        ? 0
                        : batchRenderDelay;
                    const items = batchCallback(this.batchesRendered, this.props);

                    // If the batchCallback returned false, then the props to get the items
                    // from didn't exist from Ion yet
                    if (items === false) {
                        return;
                    }

                    setTimeout(() => {
                        this.setState({
                            itemsToRender: items,
                        });
                    }, renderDelay);
                    this.batchesRendered++;
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
