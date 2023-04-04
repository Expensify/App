const resetDisplayListViewborderWhenBlur = (event, containerRef, setDisplayListViewBorder) => {
    console.log('native', setDisplayListViewBorder);
    setDisplayListViewBorder(false);
};

export default {
    resetDisplayListViewborderWhenBlur,
};
