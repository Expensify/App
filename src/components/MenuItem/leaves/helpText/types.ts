import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

/** Props shared by the help line leaves */
type MenuItemHelpTextSharedProps = {
    /** Whether the line reads as an error (red) instead of a hint (muted) */
    isError?: boolean;
};

/** Props of the plain text help line */
type MenuItemHelpTextProps = MenuItemHelpTextSharedProps & {
    /** Error or hint text to render under the row. Nothing renders when it is empty */
    message?: string | ReactNode;

    /** Renders message as HTML (for markdown copy with links) using the same layout as plain help text */
    shouldRenderMessageAsHTML?: boolean;
};

/** Props of the HTML help line */
type MenuItemHelpTextHTMLProps = MenuItemHelpTextSharedProps & {
    /** HTML of the error or hint. Markdown has to be turned into HTML by the caller first, e.g. with `Parser.replace` */
    children: string;
};

/** Props of the base both help line leaves render through */
type BaseMenuItemHelpTextProps = MenuItemHelpTextSharedProps & {
    /** Text of the line. Kept apart from `children` so errors given as text still get announced */
    message?: string | ReactNode;

    /** Content of the line, rendered instead of `message` */
    children?: ReactNode;

    /** Spacing of the line, which depends on where the leaf sits */
    style?: StyleProp<ViewStyle>;

    shouldRenderMessageAsHTML?: boolean;
};

export type {BaseMenuItemHelpTextProps, MenuItemHelpTextHTMLProps, MenuItemHelpTextProps};
