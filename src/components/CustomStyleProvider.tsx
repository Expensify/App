import React, {useMemo} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

type CustomStyleContextType = StyleProp<ViewStyle & TextStyle> | null;

const CustomStyleContext = React.createContext<CustomStyleContextType>(null);

type CustomStyleProviderProps = React.PropsWithChildren & {
    style: StyleProp<ViewStyle & TextStyle> | null;
};

function CustomStyleProvider({children, style}: CustomStyleProviderProps) {
    const value = useMemo(() => style, [style]);

    return <CustomStyleContext.Provider value={value}>{children}</CustomStyleContext.Provider>;
}

CustomStyleProvider.displayName = 'CustomStyleProvider';

export default CustomStyleProvider;
export {CustomStyleContext};
