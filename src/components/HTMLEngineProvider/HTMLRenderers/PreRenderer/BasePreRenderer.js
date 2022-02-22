import React, {forwardRef} from 'react';
import {ScrollView} from 'react-native';
import PropTypes from 'prop-types';
import htmlRendererPropTypes from '../htmlRendererPropTypes';
import styles from '../../../../styles/styles';

const propTypes = {
    /** Passed via forwardRef so we can access the ScrollView ref */
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(ScrollView)}),
    ]),
    ...htmlRendererPropTypes,
};

const defaultProps = {
    innerRef: null,
};

const BasePreRenderer = (props) => {
    const TDefaultRenderer = props.TDefaultRenderer;

    return (
        <ScrollView ref={props.innerRef} horizontal style={props.style}>
            <TDefaultRenderer
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                style={[styles.flexGrow1, styles.flexShrink1]}
            />
        </ScrollView>
    );
};

BasePreRenderer.propTypes = propTypes;
BasePreRenderer.displayName = 'BasePreRenderer';
BasePreRenderer.defaultProps = defaultProps;


export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BasePreRenderer {...props} innerRef={ref} />
));
