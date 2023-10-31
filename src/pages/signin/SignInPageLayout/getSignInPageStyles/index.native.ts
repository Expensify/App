import {ViewStyle} from 'react-native';
import {Styles} from '@styles/styles';

// Using flexGrow on mobile allows the ScrollView container to grow to fit the content.
// This is necessary because making the sign-in content fit exactly the viewheight causes the scroll to stop working on mobile.
export default function getSignInPageStyles(styles: Styles): ViewStyle {
    return styles.flexGrow1 as ViewStyle;
}
