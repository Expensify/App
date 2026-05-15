import {useState} from 'react';
import {TableData} from '../types';

export default function useSelection<DataType extends TableData>() {
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const middleware = (data: DataType[]) => {
        return data.map((item) => ({...item, selected: selectedKeys.includes(item.rowKey)}));
    };

    return {};
}
