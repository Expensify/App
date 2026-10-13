import type ShouldWaitForSheetToHide from './types';

/** Web navigates right away: a navigation fired while a bottom sheet is up is not dropped, and the sheet's hide callback is unreliable (e.g. on Safari). */
const shouldWaitForSheetToHide: ShouldWaitForSheetToHide = () => false;

export default shouldWaitForSheetToHide;
