// Using flexGrow on mobile allows the ScrollView container to grow to fit the content.
// This is necessary because making the sign-in content fit exactly the viewheight causes the scroll to stop working on mobile.
import type {ThemeStyles} from '@src/styles';

const scrollViewContentContainerStyles = (styles: ThemeStyles) => styles.flexGrow1;

export default scrollViewContentContainerStyles;
