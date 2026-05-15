import {useRef, useState} from 'react';
import {TableData, TableRow} from '../types';
import {MiddlewareHookResult} from './types';

export type UseSelectionProps<DataType extends TableData> = {
    data: DataType[];
};

export type SelectionMethods = {
    handleSelectAll: () => void;

    handleMultipleRowSelection: (keyForList: string) => void;

    handleSingleRowSelection: (keyForList: string) => void;
};

export type UseSelectionResult<DataType extends TableData> = MiddlewareHookResult<DataType, SelectionMethods, TableRow<DataType>>;

export default function useSelection<DataType extends TableData>({data}: UseSelectionProps<DataType>): UseSelectionResult<DataType> {
    const lastSelectedRowKeyRef = useRef<string | null>(null);
    const lastSelectedRowIsSelectedRef = useRef<boolean>(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    /**
     *
     */
    const handleSelectAll = () => {};

    /**
     *
     */
    const handleMultipleRowSelection = (keyForList: string) => {
        const keyForLists = data.map((item) => item.keyForList);
        const keyForListExists = keyForLists.includes(keyForList);

        if (!keyForListExists) {
            return;
        }

        const lastSelectedRowKey = lastSelectedRowKeyRef.current;
        const lastSelectedRowIsSelected = lastSelectedRowIsSelectedRef.current;

        if (!lastSelectedRowKey) {
            handleSingleRowSelection(keyForList);
            return;
        }

        const currentSelectedRowIndex = keyForLists.indexOf(keyForList);
        const lastSelectedRowIndex = keyForLists.indexOf(lastSelectedRowKey);

        if (currentSelectedRowIndex === -1 || lastSelectedRowIndex === -1) {
            handleSingleRowSelection(keyForList);
            return;
        }

        const startIndex = Math.min(currentSelectedRowIndex, lastSelectedRowIndex);
        const endIndex = Math.max(currentSelectedRowIndex, lastSelectedRowIndex);

        setSelectedKeys((prevSelectedKeys) => {
            const newSelectedKeys = [...prevSelectedKeys];

            for (let i = startIndex; i <= endIndex; i++) {
                const key = keyForLists[i];
                if (lastSelectedRowIsSelected) {
                    if (!newSelectedKeys.includes(key)) {
                        newSelectedKeys.push(key);
                    }
                } else {
                    const index = newSelectedKeys.indexOf(key);
                    if (index !== -1) {
                        newSelectedKeys.splice(index, 1);
                    }
                }
            }

            return newSelectedKeys;
        });
    };

    /**
     *
     */
    const handleSingleRowSelection = (keyForList: string) => {
        setSelectedKeys((prevSelectedKeys) => {
            if (prevSelectedKeys.includes(keyForList)) {
                return prevSelectedKeys.filter((key) => key !== keyForList);
            } else {
                return [...prevSelectedKeys, keyForList];
            }
        });
    };

    const middleware = (data: DataType[]) => {
        return data.map((item) => ({...item, selected: selectedKeys.includes(item.keyForList)}));
    };

    return {
        middleware,
        methods: {
            handleSelectAll,
            handleMultipleRowSelection,
            handleSingleRowSelection,
        },
    };
}
