import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';

// no-manual-cleanup: the `cleanup` specifier in the import above is the violation.
// Valid control for the same rule is the shape used everywhere below - no cleanup import at all.

let committed = false;
let pending = false;
const title = 'Hello world';

function Screen() {
    return <p>{title}</p>;
}

// the manual teardown that the runner already performs for free
export function manualTeardown() {
    return cleanup();
}

// await-async-queries: the findByText promise is dropped
export async function droppedFindQuery() {
    screen.findByText(title);
}

// valid control: the same promise handled with await
export async function handledFindQuery() {
    const node = await screen.findByText(title);
    return node;
}

// await-async-utils: the waitFor promise is dropped
export function droppedWaitFor() {
    waitFor(() => pending);
}

// valid control: awaited waitFor
export async function handledWaitFor() {
    await waitFor(() => pending);
}

// no-unnecessary-act: a Testing Library util inside act()
export function actAroundUtil() {
    act(() => {
        fireEvent.click(screen.getByRole('button'));
    });
}

// valid control: act() over non-Testing-Library work
export function actAroundPlainCode() {
    act(() => {
        committed = true;
    });
}

// prefer-find-by: waitFor + getBy instead of findBy
export async function waitForThenGet() {
    await waitFor(() => screen.getByText(title));
}

// valid control: findBy waits on its own
export async function findByInstead() {
    const node = await screen.findByText(title);
    return node;
}

// prefer-presence-queries: getBy used for an absence assertion
export function getByForAbsence() {
    return expect(screen.getByText(title)).not.toBeInTheDocument();
}

// valid control: queryBy for the absence assertion, getBy for the presence one
export function matchingQueryVariant() {
    expect(screen.queryByText(title)).not.toBeInTheDocument();
    return expect(screen.getByText(title)).toBeInTheDocument();
}

// prefer-screen-queries: a query destructured from the render result
export function queryFromRenderResult() {
    const {getByText} = render(<Screen />);
    return getByText(title);
}

// valid control: the same query taken from screen
export function queryFromScreen() {
    render(<Screen />);
    return screen.getByText(title);
}

export const state = {committed, pending};
