import type {UseKeepSubmitButtonInView} from './types';

// The submit button was reported cut off under the keyboard only on Android, see index.android.ts
const useKeepSubmitButtonInView: UseKeepSubmitButtonInView = () => ({});

export default useKeepSubmitButtonInView;
