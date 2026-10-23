/**
 * Result envelope every tool returns. Contract and the tools documented but not
 * built live in melvin `docs/app-state-tools.md`.
 *
 * `ok: true` means the guaranteed state was read back inside the app before
 * returning, never just dispatched. `already: true` means the state held before
 * the call, so nothing was done. `ok: false` always carries a `reason`.
 */
type ToolResult = {
    ok: boolean;
    already?: boolean;
    state?: Record<string, unknown>;
    reason?: string;
};

/** Raw JSON Schema objects are accepted by both Appduct SDK entries. */
type ToolSchema = Record<string, unknown>;

type ToolHandler = (input: Record<string, unknown>) => Promise<ToolResult>;

/**
 * One tool as the shared module describes it. `inputSchema` and `outputSchema`
 * are required so the Appduct SDK infers `Record<string, unknown>` on both sides
 * of the handler instead of widening through an optional property.
 */
type AppductTool = {
    name: string;
    description: string;
    inputSchema: ToolSchema;
    outputSchema: ToolSchema;
    timeoutMs?: number;
    handler: ToolHandler;
};

/** What a platform entry hands the shared module: Appduct's `registerTool`. */
type RegisterTool = (tool: AppductTool) => void;

export type {ToolResult, ToolSchema, ToolHandler, AppductTool, RegisterTool};
