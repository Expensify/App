import type CustomFlashListProps from '@components/FlashList/types';

type InvertedFlashListProps<T> = CustomFlashListProps<T> & {
    shouldStartRenderingFromTop?: boolean;
};

export default InvertedFlashListProps;
