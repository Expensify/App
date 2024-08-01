import type ContainerComposeStyles from './types';

// We need to set paddingVertical = 0 on web to avoid displaying a normal pointer on some parts of compose box when not in focus
const containerComposeStyles: ContainerComposeStyles = (styles) => [styles.textInputComposeSpacing, {paddingVertical: 0}];

export default containerComposeStyles;
