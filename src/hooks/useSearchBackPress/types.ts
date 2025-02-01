type UseSearchBackPressParams = {
    onClearSelection: () => void;
    onNavigationCallBack: () => void;
    backTo?: string;
};

type UseSearchBackPress = (params: UseSearchBackPressParams) => void;

export default UseSearchBackPress;
