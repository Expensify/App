import {Middleware} from './types';

export default function useSelection<DataType>() {
    const middleware: Middleware<DataType> = (data) => {
        // Return filtered data;
        return data;
    };

    return {middleware};
}
