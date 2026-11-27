/** Keep the gradient static; only the containing strip's transform is animated. */
import type {ViewStyle} from 'react-native';

function getGradientStyle(backgroundColor: string, foregroundColor: string): ViewStyle {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- This is React Native's public gradient style property.
    return {experimental_backgroundImage: `linear-gradient(to right, ${backgroundColor}, ${foregroundColor}, ${backgroundColor})`};
}

export default getGradientStyle;
