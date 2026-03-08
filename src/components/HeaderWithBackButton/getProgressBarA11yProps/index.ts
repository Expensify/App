/**
 * Web: The progress bar uses an opacity:0 Text element for screen readers.
 * accessibilityLabel would map to aria-label and duplicate the announcement.
 */
import type {GetProgressBarA11yProps} from './types';

const getProgressBarA11yProps: GetProgressBarA11yProps = () => ({});

export default getProgressBarA11yProps;
