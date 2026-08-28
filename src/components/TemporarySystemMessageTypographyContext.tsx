import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {createContext, useContext} from 'react';

type TemporarySystemMessageTypography = 'micro' | 'body';

const TemporarySystemMessageTypographyContext = createContext<TemporarySystemMessageTypography | undefined>(undefined);

type TemporarySystemMessageTypographyProviderProps = ChildrenProps & {
    value: TemporarySystemMessageTypography;
};

/** NEVER MERGE: scopes temporary comparison typography to passive system-message content only. */
function TemporarySystemMessageTypographyProvider({children, value}: TemporarySystemMessageTypographyProviderProps) {
    return <TemporarySystemMessageTypographyContext.Provider value={value}>{children}</TemporarySystemMessageTypographyContext.Provider>;
}

function useTemporarySystemMessageTypography(): TemporarySystemMessageTypography | undefined {
    return useContext(TemporarySystemMessageTypographyContext);
}

export {TemporarySystemMessageTypographyProvider, useTemporarySystemMessageTypography};
export type {TemporarySystemMessageTypography};
