/**
 * Shared mock for `@libs/actions/IOU/submitWithDismissFirst`.
 *
 * Bypasses dismiss-first navigation orchestration — executes the write
 * immediately with defaults so tests can assert the underlying action calls
 * without needing full Navigation mocks.
 *
 * Usage in test files:
 *   jest.mock('@libs/actions/IOU/submitWithDismissFirst', () => jest.requireActual('../../__mocks__/submitWithDismissFirst'));
 */
import type {WriteOverrides} from '@libs/actions/IOU/submitWithDismissFirst';

const submitWithDismissFirst = ({executeWrite}: {executeWrite: (overrides?: WriteOverrides) => void}) => {
    executeWrite({shouldHandleNavigation: true, shouldDeferForSearch: false});
};

// eslint-disable-next-line import/prefer-default-export -- named export matches the real module's API
export {submitWithDismissFirst};
