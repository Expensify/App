import type {WiseOnboardingUnsavedPages} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** Whether a Wise onboarding page save is still running */
const isSavingWiseOnboardingPageSelector = (pendingSaves: OnyxEntry<Record<string, boolean>>) => Object.values(pendingSaves ?? {}).some(Boolean);

/** Keys of the Wise onboarding pages that have not saved yet, as when their save is running or failed, or the user left them offline */
const unsavedWiseOnboardingPageKeysSelector = (unsavedPages: OnyxEntry<WiseOnboardingUnsavedPages>) => {
    const allUnsavedPages = [...Object.entries(unsavedPages?.saveNotSucceeded ?? {}), ...Object.entries(unsavedPages?.leftOffline ?? {})];
    return [...new Set(allUnsavedPages.filter(([, isUnsaved]) => isUnsaved).map(([pageKey]) => pageKey))];
};

export {isSavingWiseOnboardingPageSelector, unsavedWiseOnboardingPageKeysSelector};
