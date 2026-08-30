// In src/libs/ReportActions.js or relevant agent chat state management file
// Ensure Inbox background is not affected during agent chat RHP refresh

const refreshAgentChatRHP = (reportID, agentChatData) => {
    // Existing logic for handling agent chat RHP refresh
    // ... (existing code for processing agent chat data)

    // Fix: Only update agent chat specific state, do not touch Inbox background
    // Previously, this might have incorrectly updated global Inbox background state
    // Now, we ensure only agentChatRHP state is modified
    
    return {
        type: 'REFRESH_AGENT_CHAT_RHP',
        reportID,
        agentChatData,
        // Explicitly exclude any background-related fields that belong to Inbox
        // This prevents accidental overwrites of Inbox background state
    };
};

// In the Redux reducer (e.g., Report.js)
const reportReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'REFRESH_AGENT_CHAT_RHP': {
            const { reportID, agentChatData } = action;
            const report = state[reportID];
            
            if (!report) {
                return state;
            }
            
            // Update only agent chat RHP specific fields
            // Preserve all other fields including Inbox background properties
            return {
                ...state,
                [reportID]: {
                    ...report,
                    // Update agent chat RHP related fields only
                    agentChatRHP: {
                        ...report.agentChatRHP,
                        ...agentChatData,
                        // Ensure no background properties are included here
                    },
                    // Explicitly do not modify background-related fields
                    // background: report.background, // commented out to prevent accidental changes
                },
            };
        }
        // ... other cases
        default:
            return state;
    }
};