import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React from 'react';

type CustomStylesForChildrenContextType = StyleProp<ViewStyle & TextStyle> | null;

const CustomStylesForChildrenContext = React.createContext<CustomStylesForChildrenContextType>(null);

type CustomStylesForChildrenProviderProps = React.PropsWithChildren & {
    style: StyleProp<ViewStyle & TextStyle> | null;
};

function CustomStylesForChildrenProvider({children, style}: CustomStylesForChildrenProviderProps) {
    const value = style;

    return <CustomStylesForChildrenContext.Provider value={value}>{children}</CustomStylesForChildrenContext.Provider>;
}

export default CustomStylesForChildrenProvider;
export {CustomStylesForChildrenContext};
