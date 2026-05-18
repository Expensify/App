import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import type WillBlurTextInputOnTapOutside from './types';

const willBlurTextInputOnTapOutside: WillBlurTextInputOnTapOutside = () => !getIsNarrowLayout();

export default willBlurTextInputOnTapOutside;
