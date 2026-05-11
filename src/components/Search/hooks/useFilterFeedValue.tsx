import useFilterFeedData from './useFilterFeedData';

function useFilterFeedValue(value: string[] | undefined): string {
    const {feedValue} = useFilterFeedData(value);
    return feedValue.map((item) => item.text).join(', ');
}

export default useFilterFeedValue;
