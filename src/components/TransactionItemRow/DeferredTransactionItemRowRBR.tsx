import React, {useDeferredValue} from 'react';

import TransactionItemRowRBR from './TransactionItemRowRBR';

type DeferredTransactionItemRowRBRProps = React.ComponentProps<typeof TransactionItemRowRBR> & {
    /** When false, renders RBR immediately. Use false in FlashList rows to avoid recycling/layout issues from deferred mount. */
    shouldDefer?: boolean;
};

function DeferredTransactionItemRowRBR({shouldDefer = true, ...props}: DeferredTransactionItemRowRBRProps) {
    const deferredShouldRender = useDeferredValue(true, false);
    const shouldRender = shouldDefer ? deferredShouldRender : true;

    // Skip placeholder while deferring to avoid layout shift on rows without RBR content
    if (!shouldRender) {
        return null;
    }

    // Deferred wrapper intentionally forwards all props to the underlying component

    return <TransactionItemRowRBR {...props} />;
}

export default DeferredTransactionItemRowRBR;
