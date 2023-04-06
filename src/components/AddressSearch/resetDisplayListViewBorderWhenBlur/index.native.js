const resetDisplayListViewBorderWhenBlur = (event, containerRef, setDisplayListViewBorder) => {
    // The related target check is not required here because in native there is no race condition rendering like on the web
    // onPress still called when cliking the option
    setDisplayListViewBorder(false);
};

resetDisplayListViewBorderWhenBlur.displayName = 'resetDisplayListViewBorderWhenBlur';

export default resetDisplayListViewBorderWhenBlur;

