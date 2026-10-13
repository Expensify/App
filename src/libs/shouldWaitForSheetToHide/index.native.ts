import type ShouldWaitForSheetToHide from './types';

/** Native drops a navigation fired while a bottom sheet is still up, so the navigation waits for the sheet to hide. */
const shouldWaitForSheetToHide: ShouldWaitForSheetToHide = () => true;

export default shouldWaitForSheetToHide;
