const resetDisplayListViewborderWhenBlur = (event, containerRef, setDisplayListViewBorder) => {
    if (containerRef.current && event.target && containerRef.current.contains(event.relatedTarget)) {
        return;
    }
    setDisplayListViewBorder(false);
};

export default {
    resetDisplayListViewborderWhenBlur,
};
