import type {Freeze} from 'react-freeze';

type ReactFreezeMock = {
    Freeze: typeof Freeze;
};

const reactFreezeMock: ReactFreezeMock = {
    Freeze: (props) => props.children as JSX.Element,
};

export default reactFreezeMock;
