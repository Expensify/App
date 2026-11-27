import type {ViewStyle} from 'react-native';

type SpacingKey = keyof Pick<ViewStyle, 'margin' | 'marginHorizontal' | 'marginLeft' | 'marginRight' | 'padding' | 'paddingHorizontal' | 'paddingLeft' | 'paddingRight'>;

/**
 * The spacing a flattened style sets on one side, from the most to the least specific key. Code that adds to a view's
 * spacing reads it first, because a later style entry replaces a side's spacing rather than adding to it.
 */
function getSpacing(style: ViewStyle, keys: SpacingKey[]): number {
    for (const key of keys) {
        const value = style[key];
        if (typeof value === 'number') {
            return value;
        }
    }
    return 0;
}

export default getSpacing;
