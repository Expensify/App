import React, {useEffect, forwardRef, useState} from 'react';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import addViewportResizeListener from '../libs/VisualViewport';
import refPropTypes from './refPropTypes';

const viewportOffsetTopPropTypes = {
    // viewportOffsetTop returns the offset of the top edge of the visual viewport from the
    // top edge of the layout viewport in CSS pixels, when the visual viewport is resized.

    viewportOffsetTop: PropTypes.number.isRequired,
};

export default function (WrappedComponent) {
    function WithViewportOffsetTop(props) {
        const [viewportOffsetTop, setViewportOffsetTop] = useState(0);

        useEffect(() => {
            /**
             * @param {SyntheticEvent} e
             */
            const updateDimensions = (e) => {
                const targetOffsetTop = lodashGet(e, 'target.offsetTop', 0);
                setViewportOffsetTop(targetOffsetTop);
            };

            const removeViewportResizeListener = addViewportResizeListener(updateDimensions);

            return () => {
                removeViewportResizeListener();
            };
        }, []);

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                viewportOffsetTop={viewportOffsetTop}
            />
        );
    }

    WithViewportOffsetTop.displayName = `WithViewportOffsetTop(${getComponentDisplayName(WrappedComponent)})`;
    WithViewportOffsetTop.propTypes = {
        forwardedRef: refPropTypes,
    };
    WithViewportOffsetTop.defaultProps = {
        forwardedRef: undefined,
    };
    return forwardRef((props, ref) => (
        <WithViewportOffsetTop
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));
}

export {viewportOffsetTopPropTypes};
