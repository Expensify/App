import type {LegendListRef} from '@legendapp/list/react-native';

type NativeListItem = {
    setNativeProps?: (props: {style: {zIndex: number}}) => void;
};

/** Applies z-index to LegendList's native item container rather than to the rendered item inside it. */
function setLegendListItemZIndex(list: LegendListRef | null, index: number, zIndex: number): boolean {
    const itemContainer: unknown = list?.getState().elementAtIndex(index);
    if (!isNativeListItem(itemContainer)) {
        return false;
    }

    itemContainer.setNativeProps({style: {zIndex}});
    return true;
}

function isNativeListItem(value: unknown): value is NativeListItem & Required<Pick<NativeListItem, 'setNativeProps'>> {
    return typeof value === 'object' && value !== null && 'setNativeProps' in value && typeof value.setNativeProps === 'function';
}

export default setLegendListItemZIndex;
