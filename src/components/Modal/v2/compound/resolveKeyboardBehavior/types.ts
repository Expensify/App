type SheetKeyboardBehavior = 'padding' | 'height' | 'position';

type ResolveKeyboardBehavior = (behavior: SheetKeyboardBehavior | undefined) => SheetKeyboardBehavior | undefined;

export type {SheetKeyboardBehavior, ResolveKeyboardBehavior};
