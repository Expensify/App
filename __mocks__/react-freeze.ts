import type {Freeze as FreezeComponent} from 'react-freeze';

const Freeze: typeof FreezeComponent = (props) => props.children as JSX.Element;

export {
    // eslint-disable-next-line import/prefer-default-export
    Freeze,
};
