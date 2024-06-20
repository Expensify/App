import type FontWeightBoldStyles from './types';

// Android has ExpensifyNeue-Bold, but fontWeight: '700' will result in
// an incorrect font displaying on Android
const bold: FontWeightBoldStyles = '600';

export default bold;
