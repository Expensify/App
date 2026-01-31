import type {ViewStyle} from 'react-native';

type GetReceiptContainerPaddingStyle = (shouldRestrictHeight: boolean, pt10Style: ViewStyle) => ViewStyle | undefined;

export default GetReceiptContainerPaddingStyle;
