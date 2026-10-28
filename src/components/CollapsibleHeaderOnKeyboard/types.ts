type CollapsibleHeaderOnKeyboardProps = {
    children: React.ReactNode;
    /**
     * Additional vertical space (in px) occupied on screen by elements other than the wrapped
     * component, keyboard, and focused input.
     */
    collapsibleHeaderOffset?: number;

    /**
     * If true, the header will always collapse on keyboard open,
     * regardless if there is enough space for the input above the keyboard.
     */
    alwaysCollapseHeaderOnKeyboard?: boolean;
};

type CollapsibleHeaderOnKeyboardGroupProps = {
    children: React.ReactNode;

    /**
     * Additional vertical space (in px) occupied on screen by elements that are neither members of this group,
     * the keyboard, nor the focused input.
     */
    collapsibleHeaderOffset?: number;
};

type CollapsibleHeaderOnKeyboardGroupMemberProps = {
    children: React.ReactNode;
};

export type {CollapsibleHeaderOnKeyboardProps, CollapsibleHeaderOnKeyboardGroupProps, CollapsibleHeaderOnKeyboardGroupMemberProps};
