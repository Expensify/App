import type ScrollViewContentContainerStyles from './types';

// Using flexGrow on mobile allows the ScrollView container to grow to fit the content.
// This is necessary because making the sign-in content fit exactly the viewheight causes the scroll to stop working on mobile.
const scrollViewContentContainerStyles: ScrollViewContentContainerStyles = (styles) => styles.flexGrow1;

export default scrollViewContentContainerStyles;
