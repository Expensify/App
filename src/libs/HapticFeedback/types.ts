type HapticFeedback = {
    press: () => void;
    longPress: () => void;
    success: () => void;
    error: () => void;
    selection: () => void;
    expenseSuccess: () => void;
    expenseCreateError: () => void;
    loading: () => void;
    expenseSubmitSuccess: () => void;
};

export default HapticFeedback;
