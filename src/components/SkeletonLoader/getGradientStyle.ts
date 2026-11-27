import type {ViewStyle} from 'react-native';

function getGradientStyle(backgroundColor: string, foregroundColor: string): ViewStyle {
    return {backgroundImage: `linear-gradient(to right, ${backgroundColor}, ${foregroundColor}, ${backgroundColor})`};
}

export default getGradientStyle;
