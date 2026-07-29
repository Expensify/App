/** Test mock: bypass dismiss-first nav and invoke the write synchronously with fallback overrides. */
import type {WriteOverrides} from '@libs/Navigation/helpers/submitWithDismissFirst';

const submitWithDismissFirst = ({executeWrite}: {executeWrite: (overrides: WriteOverrides) => void}): void => {
    executeWrite({shouldHandleNavigation: true});
};

// eslint-disable-next-line import/prefer-default-export -- named export matches the real module's API
export {submitWithDismissFirst};
