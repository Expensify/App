type CollapsibleHeaderOnKeyboardProps = {
    children: React.ReactNode;
    /** Additional vertical space (in px) occupied on screen by elements other than the wrapped
     *  component, keyboard, and focused input — e.g. a tab bar below the list.
     *  The collapse target is reduced by this amount so those elements are not counted twice. */
    collapsibleHeaderOffset?: number;

    /**
     * If true, the header will always collapse on keyboard open,
     * regardless if there is enough space for the input above the keyboard.
     */
    alwaysCollapseHeaderOnKeyboard?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {CollapsibleHeaderOnKeyboardProps};
