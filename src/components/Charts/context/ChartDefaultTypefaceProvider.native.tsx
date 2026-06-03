import type {DataModule} from '@shopify/react-native-skia';
import {useTypeface} from '@shopify/react-native-skia';
import React from 'react';
import {ChartDefaultTypefaceContext} from './ChartDefaultTypefaceContext';

function ChartDefaultTypefaceProvider({children}: {children: React.ReactNode}) {
    const regular = useTypeface(require('@assets/fonts/native/ExpensifyNeue-Regular.otf') as DataModule);
    const bold = useTypeface(require('@assets/fonts/native/ExpensifyNeue-Bold.otf') as DataModule);

    return <ChartDefaultTypefaceContext.Provider value={{regular, bold}}>{children}</ChartDefaultTypefaceContext.Provider>;
}

ChartDefaultTypefaceProvider.displayName = 'ChartDefaultTypefaceProvider';

export default ChartDefaultTypefaceProvider;
