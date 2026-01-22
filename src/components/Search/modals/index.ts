/**
 * Search Modals Module
 *
 * Self-contained modal components for the Search page.
 * Following the composition pattern - each modal manages its own
 * rendering based on visibility props.
 */

export {default as SearchOfflineModal} from './SearchOfflineModal';
export {default as SearchDownloadErrorModal} from './SearchDownloadErrorModal';

export type {SearchOfflineModalProps} from './SearchOfflineModal';
export type {SearchDownloadErrorModalProps} from './SearchDownloadErrorModal';
