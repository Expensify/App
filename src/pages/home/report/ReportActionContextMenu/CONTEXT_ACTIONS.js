import {
    Clipboard, LinkCopy, Mail, Pencil, Trashcan,
} from '../../../../components/Icon/Expensicons';

/**
 * A list of all the context actions in this menu.
 * NOTE: The ReportActionContextMenu has
 */
export default [
    // Copy to clipboard
    {
        text: 'Copy to Clipboard',
        icon: Clipboard,
    },

    // Copy chat link
    {
        text: 'Copy Link',
        icon: LinkCopy,
    },

    // Mark as Unread
    {
        text: 'Mark as Unread',
        icon: Mail,
    },

    // Edit Comment
    {
        text: 'Edit Comment',
        icon: Pencil,
    },

    // Delete Comment
    {
        text: 'Delete Comment',
        icon: Trashcan,
    },
];
