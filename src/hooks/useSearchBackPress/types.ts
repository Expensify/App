type UseSearchBackPressParams = {
    onClearSelection: () => void;
    onNavigationCallBack: () => void;
};

type UseSearchBackPress = (params: UseSearchBackPressParams) => void;

export default UseSearchBackPress;
