import React from 'react';

const ContextMenuContextDefaultValue = {
    showContextMenu: () => {},
    hideContextMenu: () => {},
    isActiveReportAction: () => {},
    showDeleteConfirmModal: () => {},
};
const ContextMenuContext = React.createContext(ContextMenuContextDefaultValue);
ContextMenuContext.displayName = 'ContextMenuContext';

export {ContextMenuContext, ContextMenuContextDefaultValue};
