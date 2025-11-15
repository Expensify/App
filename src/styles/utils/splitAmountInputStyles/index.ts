import type SplitPercentageInputStyles from './types';

const splitPercentageInputStyles: SplitPercentageInputStyles = (styles, isSmallScreenWidth = false) => [isSmallScreenWidth ? styles.optionRowAmountMobileInputContainer : {}];
export default splitPercentageInputStyles;
