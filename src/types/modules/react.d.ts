import type React from 'react';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/ban-types
    function forwardRef<T, P = {}>(render: (props: P, ref: React.ForwardedRef<T>) => React.ReactElement | null): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}
