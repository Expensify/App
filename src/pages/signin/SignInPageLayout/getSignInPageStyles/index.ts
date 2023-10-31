import {ViewStyle} from 'react-native';
import {Styles} from '@styles/styles';

// On web, we can use flex to fit the content to fit the viewport within a ScrollView.
export default function getSignInPageStyles(styles: Styles): ViewStyle {
    return styles.flex1 as ViewStyle;
}
