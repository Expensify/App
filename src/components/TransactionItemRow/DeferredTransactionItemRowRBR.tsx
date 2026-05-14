import React, {useDeferredValue} from 'react';
import TransactionItemRowRBR from './TransactionItemRowRBR';

type DeferredTransactionItemRowRBRProps = React.ComponentProps<typeof TransactionItemRowRBR>;

function DeferredTransactionItemRowRBR(props: DeferredTransactionItemRowRBRProps) {
    const shouldRender = useDeferredValue(true, false);

    // Skip placeholder while deferring to avoid layout shift on rows without RBR content
    if (!shouldRender) {
        return null;
    }

    // Deferred wrapper intentionally forwards all props to the underlying component
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TransactionItemRowRBR {...props} />;
}

export default DeferredTransactionItemRowRBR;
