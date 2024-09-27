import {CellContainer} from '@shopify/flash-list';
import type {CellContainerProps} from '@shopify/flash-list/dist/native/cell-container/CellContainer';

function OptionRowRendererComponent(props: CellContainerProps) {
    return (
        <CellContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[props.style, {zIndex: -props.index}]}
        />
    );
}

OptionRowRendererComponent.displayName = 'OptionRowRendererComponent';

export default OptionRowRendererComponent;
