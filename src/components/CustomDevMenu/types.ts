import type {ReactElement} from 'react';

type CustomDevMenuElement = {
    (): ReactElement;
    displayName: string;
};

export default CustomDevMenuElement;
