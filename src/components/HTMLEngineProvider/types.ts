import { ReactNode } from 'react';

type HTMLEngineProviderProps = {
   /** Children to wrap in HTMLEngineProvider. */
    children?: ReactNode

    /** Optional debug flag. Prints the TRT in the console when true. */
    debug?: boolean
}

export default HTMLEngineProviderProps;
