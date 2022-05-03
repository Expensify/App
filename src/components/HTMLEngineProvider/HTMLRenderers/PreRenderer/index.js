import React, {useEffect, useRef} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View} from 'react-native';
import _ from 'underscore';
import withLocalize from '../../../withLocalize';
import htmlRendererPropTypes from '../htmlRendererPropTypes';

const PreRenderer = (props) => {
    const TDefaultRenderer = props.TDefaultRenderer;
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer']);
    const ref = useRef();

    const wheelEvent = (event) => {
        const node = ref.current.getScrollableNode();
        const checkOverflow = (node.scrollHeight / node.scrollWidth) !== (node.offsetHeight / node.offsetWidth);

        if ((event.currentTarget === node) && checkOverflow) {
            node.scrollLeft += event.deltaX;
            event.preventDefault();
            event.stopPropagation();
        }
    };

    useEffect(() => {
        if (ref.current) {
            ref.current.getScrollableNode()
                .addEventListener('wheel', wheelEvent);
        }
        return () => ref.current.getScrollableNode().removeEventListener('wheel', wheelEvent);
    }, []);

    return (
        <ScrollView ref={ref} horizontal>
            <View onStartShouldSetResponder={() => true}>
                <TDefaultRenderer
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                />
            </View>
        </ScrollView>
    );
};

PreRenderer.propTypes = htmlRendererPropTypes;
PreRenderer.displayName = 'PreRenderer';

export default withLocalize(PreRenderer);
