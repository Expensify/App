import type {StyleProp, ViewStyle} from 'react-native';

type GetContentContainerStyle = (
    isCompactMode: boolean,
    flex1Style: ViewStyle,
) => {
    contentContainerStyle: StyleProp<ViewStyle> | undefined;
};

export default GetContentContainerStyle;
