const initialState = {
    tasks: [],
    lastFetchTime: null,
    isLoading: false,
    error: null
};

export default function onboardingReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_ONBOARDING_TASKS': {
            const allTasks = [...state.tasks, ...action.tasks];
            const uniqueTasks = allTasks.reduce((acc, task) => {
                if (!task || !task.id) return acc;
                const existing = acc.find(t => t.id === task.id);
                if (!existing) {
                    acc.push(task);
                } else if (task.updatedAt > existing.updatedAt) {
                    const idx = acc.indexOf(existing);
                    acc[idx] = task;
                }
                return acc;
            }, []);
            
            console.log('[Onboarding Reducer] Tasks: ' + state.tasks.length + ' -> ' + uniqueTasks.length);
            
            return {
                ...state,
                tasks: uniqueTasks,
                lastFetchTime: action.lastFetchTime || state.lastFetchTime,
                isLoading: false,
                error: null
            };
        }
        
        case 'RESET_ONBOARDING_TASKS':
            return { ...initialState };
            
        case 'FETCH_ONBOARDING_TASKS_START':
            return { ...state, isLoading: true, error: null };
            
        case 'FETCH_ONBOARDING_TASKS_ERROR':
            return { ...state, isLoading: false, error: action.error };
            
        default:
            return state;
    }
}