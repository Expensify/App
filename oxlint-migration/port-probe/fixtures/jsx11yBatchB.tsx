import React from 'react';

// Plain DOM JSX -- no React Native. One element per line so both tools anchor identically.
// Part B covers the role and interaction rules; content and ARIA-attribute rules are in jsx11yBatchA.tsx.
// Controls are chosen so they do not trip another rule in this same file: every finding a rule
// claims here must be the only one of its kind in the file.

// jsx-a11y/interactive-supports-focus -- clickable role with no tabIndex; control adds tabIndex.
function InteractiveSupportsFocus() {
    return (
        <>
            <div
                role="button"
                onClick={() => undefined}
            />
            <div
                role="button"
                tabIndex={0}
                onClick={() => undefined}
            />
        </>
    );
}

// jsx-a11y/mouse-events-have-key-events -- onMouseOver with no onFocus; control pairs them.
function MouseEventsHaveKeyEvents() {
    return (
        <>
            <div onMouseOver={() => undefined} />
            <div
                onMouseOver={() => undefined}
                onFocus={() => undefined}
            />
        </>
    );
}

// jsx-a11y/no-access-key -- accessKey is a duplicate of the tab sequence; control omits it.
function NoAccessKey() {
    return (
        <>
            <button
                type="button"
                accessKey="s"
            >
                Save
            </button>
            <button type="button">Save</button>
        </>
    );
}

// jsx-a11y/no-autofocus -- DOM element, so production's ignoreNonDOM: true does not excuse it.
function NoAutofocus() {
    return (
        <>
            <input
                type="text"
                autoFocus
            />
            <input type="text" />
        </>
    );
}

// jsx-a11y/no-distracting-elements -- production lists marquee and blink; control is a <p>.
function NoDistractingElements() {
    return (
        <>
            <marquee>Latest reports</marquee>
            <p>Latest reports</p>
        </>
    );
}

// jsx-a11y/no-interactive-element-to-noninteractive-role -- a button demoted to presentation;
// control keeps its implicit button role.
function NoInteractiveElementToNoninteractiveRole() {
    return (
        <>
            <button
                type="button"
                role="presentation"
            />
            <button type="button">Save</button>
        </>
    );
}

// jsx-a11y/no-noninteractive-element-interactions -- heading carries a click handler; control moves
// the handler onto an interactive element.
function NoNoninteractiveElementInteractions() {
    return (
        <>
            <h3 onClick={() => undefined}>Report summary</h3>
            <button
                type="button"
                onClick={() => undefined}
            >
                Save
            </button>
        </>
    );
}

// jsx-a11y/no-noninteractive-element-to-interactive-role -- <p> promoted to button; control is the
// production allow-list itself, ul with role="menu".
function NoNoninteractiveElementToInteractiveRole() {
    return (
        <>
            <p role="button">Notes</p>
            <ul
                role="menu"
                tabIndex={0}
            />
        </>
    );
}

// jsx-a11y/no-noninteractive-tabindex -- tabIndex on a plain <div>; control is production's
// roles: ["tabpanel"] allow-list.
function NoNoninteractiveTabindex() {
    return (
        <>
            <div tabIndex={0} />
            <div
                role="tabpanel"
                tabIndex={0}
            />
        </>
    );
}

// jsx-a11y/no-redundant-roles -- <ul> already implies list; control picks a role ul does not have.
function NoRedundantRoles() {
    return (
        <>
            <ul role="list" />
            <ul
                role="listbox"
                tabIndex={0}
            />
        </>
    );
}

// jsx-a11y/no-static-element-interactions -- clickable <div> with no role; control gives it one.
function NoStaticElementInteractions() {
    return (
        <>
            <div onClick={() => undefined}>Tap to expand</div>
            <div
                role="button"
                tabIndex={0}
                onClick={() => undefined}
            >
                Tap to expand
            </div>
        </>
    );
}

// jsx-a11y/role-has-required-aria-props -- checkbox without aria-checked (tabIndex keeps
// interactive-supports-focus quiet); control supplies aria-checked.
function RoleHasRequiredAriaProps() {
    return (
        <>
            <div
                role="checkbox"
                tabIndex={0}
            />
            <div
                role="checkbox"
                aria-checked={false}
                tabIndex={0}
            />
        </>
    );
}

// jsx-a11y/role-supports-aria-props -- aria-sort belongs to columnheader, not checkbox; control uses
// an aria prop checkbox does support.
function RoleSupportsAriaProps() {
    return (
        <>
            <div
                role="checkbox"
                aria-checked={false}
                aria-sort="ascending"
                tabIndex={0}
            />
            <div
                role="checkbox"
                aria-checked={false}
                aria-label="Terms"
                tabIndex={0}
            />
        </>
    );
}

// jsx-a11y/scope -- scope outside a table cell; control puts it on <th>.
function Scope() {
    return (
        <>
            <div scope="col">Name</div>
            <th scope="col">Name</th>
        </>
    );
}

// jsx-a11y/tabindex-no-positive -- tabIndex={3} jumps the tab order; control uses 0. The element is a
// button so no-noninteractive-tabindex stays out of this rule's count.
function TabindexNoPositive() {
    return (
        <>
            <button
                type="button"
                tabIndex={3}
            >
                Save
            </button>
            <button
                type="button"
                tabIndex={0}
            >
                Save
            </button>
        </>
    );
}

export default {
    InteractiveSupportsFocus,
    MouseEventsHaveKeyEvents,
    NoAccessKey,
    NoAutofocus,
    NoDistractingElements,
    NoInteractiveElementToNoninteractiveRole,
    NoNoninteractiveElementInteractions,
    NoNoninteractiveElementToInteractiveRole,
    NoNoninteractiveTabindex,
    NoRedundantRoles,
    NoStaticElementInteractions,
    RoleHasRequiredAriaProps,
    RoleSupportsAriaProps,
    Scope,
    TabindexNoPositive,
};
