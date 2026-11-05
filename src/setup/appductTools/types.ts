// ok:true means the state was read back inside the app, never just dispatched. already:true means
// it held before the call. ok:false always carries a reason.
type ToolResult = {
    ok: boolean;
    already?: boolean;
    state?: Record<string, unknown>;
    reason?: string;
};

type ToolSchema = Record<string, unknown>;

const TOOL_RESULT_SCHEMA: ToolSchema = {
    type: 'object',
    properties: {
        ok: {type: 'boolean'},
        already: {type: 'boolean'},
        state: {type: 'object'},
        reason: {type: 'string'},
    },
    required: ['ok'],
};

type ToolHandler = (input: Record<string, unknown>) => Promise<ToolResult>;

// Both schemas are required so the SDK infers Record<string, unknown> on both sides of the handler.
type AppductTool = {
    name: string;
    description: string;
    inputSchema: ToolSchema;
    outputSchema: ToolSchema;
    timeoutMs?: number;
    handler: ToolHandler;
};

type RegisterTool = (tool: AppductTool) => void;

export {TOOL_RESULT_SCHEMA};
export type {AppductTool, RegisterTool};
