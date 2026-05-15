import {useRef, useState} from 'react';
import {TableData} from '../types';
import {MiddlewareHookResult} from './types';

export type UseSelectionProps<DataType extends TableData> = {
    data: DataType[];
};

export type SelectionMethods = {
    handleSelectAll: () => void;

    handleMultipleRowSelection: (rowKey: string) => void;

    handleSingleRowSelection: (rowKey: string) => void;
};

export type UseSelectionResult<DataType extends TableData> = MiddlewareHookResult<DataType, SelectionMethods>;

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
    const handleMultipleRowSelection = (rowKey: string) => {
        const rowKeys = data.map((item) => item.rowKey);
        const rowKeyExists = rowKeys.includes(rowKey);

        if (!rowKeyExists) {
            return;
        }

        const lastSelectedRowKey = lastSelectedRowKeyRef.current;
        const lastSelectedRowIsSelected = lastSelectedRowIsSelectedRef.current;

        if (!lastSelectedRowKey) {
            handleSingleRowSelection(rowKey);
            return;
        }

        const currentSelectedRowIndex = rowKeys.indexOf(rowKey);
        const lastSelectedRowIndex = rowKeys.indexOf(lastSelectedRowKey);

        if (currentSelectedRowIndex === -1 || lastSelectedRowIndex === -1) {
            handleSingleRowSelection(rowKey);
            return;
        }

        const startIndex = Math.min(currentSelectedRowIndex, lastSelectedRowIndex);
        const endIndex = Math.max(currentSelectedRowIndex, lastSelectedRowIndex);

        setSelectedKeys((prevSelectedKeys) => {
            const newSelectedKeys = [...prevSelectedKeys];

            for (let i = startIndex; i <= endIndex; i++) {
                const key = rowKeys[i];
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
    const handleSingleRowSelection = (rowKey: string) => {
        setSelectedKeys((prevSelectedKeys) => {
            if (prevSelectedKeys.includes(rowKey)) {
                return prevSelectedKeys.filter((key) => key !== rowKey);
            } else {
                return [...prevSelectedKeys, rowKey];
            }
        });
    };

    const middleware = (data: DataType[]) => {
        return data.map((item) => ({...item, selected: selectedKeys.includes(item.rowKey)}));
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
