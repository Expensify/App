import {CellContainer} from '@shopify/flash-list';
import type {CellContainerProps} from '@shopify/flash-list/dist/native/cell-container/CellContainer';
import type {ForwardedRef} from 'react';
import {forwardRef} from 'react';
import type {View} from 'react-native';

function OptionRowRendererComponent(props: CellContainerProps, ref: ForwardedRef<View>) {
    return (
        <CellContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            style={[props.style, {zIndex: -props.index}]}
        />
    );
}

OptionRowRendererComponent.displayName = 'OptionRowRendererComponent';

export default forwardRef(OptionRowRendererComponent);
