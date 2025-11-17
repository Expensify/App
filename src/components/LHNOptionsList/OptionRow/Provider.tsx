import {createContext} from 'react';

type Context = {
    state: {
        isFocused: boolean;
        isHovered: boolean;
    };
};

const initialState: Context = {
    state: {
        isFocused: false,
        isHovered: false,
    },
};

const OptionRowContext = createContext<Context>(initialState);

type Props = {
    children: React.ReactNode;
};

function Provider({children}: Props) {
    return <OptionRowContext value={initialState}>{children}</OptionRowContext>;
}

export {OptionRowContext};

export default Provider;
