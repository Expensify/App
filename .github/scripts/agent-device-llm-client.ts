/*
 * Thin client for the Anthropic /v1/messages endpoint.
 *
 * Decisions baked in:
 *   - Direct `fetch` instead of `@anthropic-ai/sdk` to avoid a new
 *     dependency on a CI-only path. Node 20 has fetch built in.
 *   - Prompt caching (`cache_control: {type: "ephemeral"}`) on the
 *     system message and the last tool definition. The system + tool
 *     surface is static across the run, so cache hit rate after step 1
 *     is ~100%, cutting per-call cost by 5-10x. The 5-minute TTL fits
 *     a single CI run with margin.
 *   - Bounded exponential backoff with jitter for 429/500/502/503/529.
 *     The runner's caller decides what to do on final failure (typically
 *     fall back to a deterministic bash-style assertion); this client
 *     never silently degrades.
 *   - Token budget kill-switch: total input+output tokens accumulated
 *     across the run; throw if exceeded. Bounds runaway spend if a
 *     prompt or tool design accidentally explodes context.
 */

export type AnthropicTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  cache_control?: { type: "ephemeral" };
};

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: Array<
    | { type: "text"; text: string }
    | {
        type: "image";
        source: { type: "base64"; media_type: "image/png"; data: string };
      }
    | {
        type: "tool_use";
        id: string;
        name: string;
        input: Record<string, unknown>;
      }
    | {
        type: "tool_result";
        tool_use_id: string;
        content: string;
        is_error?: boolean;
      }
  >;
};

export type AnthropicResponse = {
  id: string;
  stop_reason:
    | "end_turn"
    | "tool_use"
    | "max_tokens"
    | "stop_sequence"
    | string;
  content: Array<
    | { type: "text"; text: string }
    | {
        type: "tool_use";
        id: string;
        name: string;
        input: Record<string, unknown>;
      }
  >;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
};

export type ClientOptions = {
  apiKey: string;
  model: string;
  tokenBudget: number;
  /** Prefix written to artifacts/llm-trace.jsonl for post-mortem. */
  traceWriter?: (entry: Record<string, unknown>) => void;
};

const ANTHROPIC_VERSION = "2023-06-01";
const RETRY_DELAYS_MS = [1_000, 3_000, 9_000];
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 529]);

export class TokenBudgetExceededError extends Error {
  constructor(used: number, budget: number) {
    super(`token budget exceeded: ${used} > ${budget}`);
  }
}

export class AnthropicCallFailedError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`Anthropic API failed with status ${status}: ${body.slice(0, 200)}`);
  }
}

export class AnthropicClient {
  private tokensUsed = 0;

  constructor(private readonly opts: ClientOptions) {}

  getTokensUsed(): number {
    return this.tokensUsed;
  }

  async call(args: {
    system: string;
    tools: AnthropicTool[];
    messages: AnthropicMessage[];
    maxTokens?: number;
  }): Promise<AnthropicResponse> {
    /*
     * Mark system + last tool as cacheable. Anthropic caches the
     * contiguous prefix UP TO each `cache_control` marker, so two
     * markers means "cache through end of system" and "cache
     * through end of tools" as separate cached prefixes.
     */
    const cachedTools = args.tools.map((t, i) =>
      i === args.tools.length - 1
        ? { ...t, cache_control: { type: "ephemeral" as const } }
        : t,
    );

    const body = {
      model: this.opts.model,
      max_tokens: args.maxTokens ?? 1024,
      temperature: 0,
      system: [
        {
          type: "text",
          text: args.system,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: cachedTools,
      messages: args.messages,
    };

    /*
     * Verbose diagnostic mode: capture the full message thread + tool_use
     * calls in the trace. Trade-off is artifact size and a small risk
     * of leaking content the user typed; disabled unless DEBUG_LLM=1.
     */
    const verbose = (process.env.DEBUG_LLM ?? "") === "1";
    if (verbose) {
      const lastUser = args.messages
        .slice()
        .reverse()
        .find((m) => m.role === "user");
      const lastText = lastUser?.content.find(
        (c): c is { type: "text"; text: string } => c.type === "text",
      );
      this.opts.traceWriter?.({
        type: "request",
        message_count: args.messages.length,
        last_user_text: lastText?.text.slice(0, 1500) ?? null,
        tool_uses_in_thread: args.messages.flatMap((m) =>
          m.content
            .filter(
              (
                c,
              ): c is {
                type: "tool_use";
                id: string;
                name: string;
                input: Record<string, unknown>;
              } => c.type === "tool_use",
            )
            .map((c) => ({ id: c.id, name: c.name, input: c.input })),
        ),
      });
    }

    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const response = await this.callOnce(body);
        this.accountForUsage(response.usage);
        const baseEntry = {
          type: "response",
          attempt,
          stop_reason: response.stop_reason,
          usage: response.usage,
        } as Record<string, unknown>;
        if (verbose) {
          baseEntry.tool_uses = response.content
            .filter((c) => c.type === "tool_use")
            .map((c) => ({
              id: (c as { id: string }).id,
              name: (c as { name: string }).name,
              input: (c as { input: unknown }).input,
            }));
          baseEntry.text_preview = response.content
            .filter((c) => c.type === "text")
            .map((c) => (c as { text: string }).text.slice(0, 800));
        }
        this.opts.traceWriter?.(baseEntry);
        return response;
      } catch (e) {
        lastError = e as Error;
        if (e instanceof TokenBudgetExceededError) {
          throw e;
        }
        const retryable =
          e instanceof AnthropicCallFailedError &&
          RETRYABLE_STATUS.has(e.status);
        if (!retryable || attempt >= RETRY_DELAYS_MS.length) {
          throw e;
        }
        const base = RETRY_DELAYS_MS[attempt];
        const jitter = base * 0.3 * (Math.random() * 2 - 1);
        const wait = Math.max(0, Math.round(base + jitter));
        this.opts.traceWriter?.({
          type: "retry",
          attempt,
          status: (e as AnthropicCallFailedError).status,
          waitMs: wait,
        });
        await new Promise((r) => setTimeout(r, wait));
      }
    }
    throw lastError ?? new Error("unreachable");
  }

  private async callOnce(body: object): Promise<AnthropicResponse> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.opts.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new AnthropicCallFailedError(res.status, await res.text());
    }
    return (await res.json()) as AnthropicResponse;
  }

  private accountForUsage(usage: AnthropicResponse["usage"]): void {
    /*
     * Cache reads cost roughly 10% of normal input tokens, but for
     * budget-protection purposes we count them at face value —
     * budgets are about runaway prompt design, not pricing.
     */
    this.tokensUsed += usage.input_tokens + usage.output_tokens;
    if (this.tokensUsed > this.opts.tokenBudget) {
      throw new TokenBudgetExceededError(
        this.tokensUsed,
        this.opts.tokenBudget,
      );
    }
  }
}
