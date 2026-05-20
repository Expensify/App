/**
 * Shared mock for `@libs/Navigation/helpers/submitWithDismissFirst`.
 *
 * Bypasses dismiss-first navigation orchestration — executes the write
 * immediately with defaults so tests can assert the underlying action calls
 * without needing full Navigation mocks.
 *
 * Usage in test files:
 *   jest.mock('@libs/Navigation/helpers/submitWithDismissFirst', () => jest.requireActual('../../__mocks__/submitWithDismissFirst'));
 */
import type {WriteOverrides} from '@libs/Navigation/helpers/submitWithDismissFirst';

const submitWithDismissFirst = ({executeWrite}: {executeWrite: (overrides: WriteOverrides) => void}) => {
    executeWrite({shouldHandleNavigation: true, shouldDeferForSearch: false});
};

// eslint-disable-next-line import/prefer-default-export -- named export matches the real module's API
export {submitWithDismissFirst};
