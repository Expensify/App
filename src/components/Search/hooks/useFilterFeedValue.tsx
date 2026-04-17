import useFilterFeedData from './useFilterFeedData';

function useFilterFeedValue(): string {
    const {feedValue} = useFilterFeedData();
    return feedValue.map((item) => item.text).join(', ');
}

export default useFilterFeedValue;
