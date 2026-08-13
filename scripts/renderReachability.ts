/**
 * Render-reachability over a call graph.
 *
 * `rulesdir/no-onyx-get-in-render` can only see the position a read is written in. It cannot see that
 * a plain module function, which is a legal place for a synchronous Onyx read, is called by a hook
 * that a component calls while rendering. That path makes the read a render read anyway, so it has to
 * be checked across files before a conversion lands.
 *
 * This module holds the graph half of that check, so it can be tested on graphs whose answer is known
 * by construction. Building the real graph out of source is the job of `checkRenderReachability.ts`.
 *
 * The graph models two things:
 *
 * - A **function unit** is a function boundary that defers execution: a component body, a hook body,
 *   a plain function, an event handler. Boundaries that defer nothing (an IIFE, a synchronous
 *   `map`/`filter`/`reduce` callback, a `useMemo` callback) are not units of their own; the code
 *   inside them belongs to the unit that encloses them, because it runs when that unit runs.
 * - An **edge** `from -> to` means `from` calls `to` at a position that runs whenever `from` runs.
 *   A call written inside a nested handler is therefore an edge out of the handler, not out of the
 *   function that defines it, which is what keeps handlers off the render path.
 *
 * A unit is a render entry when React itself runs it while rendering: a component body or a hook body.
 * Everything reachable from a render entry over these edges runs during render.
 */

/** A function unit in the call graph. */
type FunctionNode = {
    /** Unique id. `checkRenderReachability.ts` uses `<repo-relative file>#<name>`. */
    id: string;

    /** True when React runs this unit while rendering, i.e. it is a component body or a hook body. */
    isRenderEntry: boolean;
};

/** A call that runs whenever the calling unit runs. */
type CallEdge = {
    from: string;
    to: string;
};

type CallGraph = {
    nodes: readonly FunctionNode[];
    edges: readonly CallEdge[];
};

type FindRenderPathsOptions = {
    /**
     * Stop after this many paths. One path is reported per render entry, so the cap bounds output on
     * a function with many callers rather than hiding a reachable result: any cap still answers yes.
     */
    maxPaths?: number;
};

const DEFAULT_MAX_PATHS = 10;

/** Callers keyed by callee, so the search can walk the graph backwards from the target. */
function buildCallerIndex(graph: CallGraph): Map<string, string[]> {
    const callersByCallee = new Map<string, string[]>();
    for (const edge of graph.edges) {
        const callers = callersByCallee.get(edge.to) ?? [];
        callers.push(edge.from);
        callersByCallee.set(edge.to, callers);
    }
    // Sorted so the reported paths do not depend on the order the graph was assembled in.
    for (const callers of callersByCallee.values()) {
        callers.sort();
    }
    return callersByCallee;
}

function buildNodeIndex(graph: CallGraph): Map<string, FunctionNode> {
    return new Map(graph.nodes.map((node) => [node.id, node]));
}

function hasNode(graph: CallGraph, nodeId: string): boolean {
    return graph.nodes.some((node) => node.id === nodeId);
}

/**
 * Every way render can reach `targetId`, one path per render entry, each path running from the entry
 * to the target. Empty means nothing that renders can reach it.
 *
 * The search walks callers breadth-first, so each path is a shortest one, and it stops at a render
 * entry rather than walking past it: a component that calls a hook that calls the target is reported
 * as the hook path, which is the closest render code to the target and the place a conversion has to
 * account for.
 */
function findRenderPaths(graph: CallGraph, targetId: string, options: FindRenderPathsOptions = {}): string[][] {
    const maxPaths = options.maxPaths ?? DEFAULT_MAX_PATHS;
    const nodesById = buildNodeIndex(graph);
    const target = nodesById.get(targetId);

    if (!target || maxPaths <= 0) {
        return [];
    }

    // The target is render code itself, so there is nothing to trace: the read is already in render.
    if (target.isRenderEntry) {
        return [[targetId]];
    }

    const callersByCallee = buildCallerIndex(graph);
    const calleeOf = new Map<string, string>();
    const visited = new Set<string>([targetId]);
    const queue: string[] = [targetId];
    const paths: string[][] = [];

    while (queue.length > 0) {
        const callee = queue.shift();

        if (!callee) {
            break;
        }

        for (const caller of callersByCallee.get(callee) ?? []) {
            if (visited.has(caller)) {
                continue;
            }
            visited.add(caller);
            calleeOf.set(caller, callee);

            if (nodesById.get(caller)?.isRenderEntry) {
                const path: string[] = [caller];
                let current: string | undefined = caller;
                while (current) {
                    current = calleeOf.get(current);

                    if (current) {
                        path.push(current);
                    }
                }
                paths.push(path);

                if (paths.length >= maxPaths) {
                    return paths;
                }
                // A render entry is the answer, so there is no point asking who calls it.
                continue;
            }

            queue.push(caller);
        }
    }

    return paths;
}

/** Whether anything that renders can reach `targetId`. A conversion is only safe when this is false. */
function isRenderReachable(graph: CallGraph, targetId: string): boolean {
    return findRenderPaths(graph, targetId, {maxPaths: 1}).length > 0;
}

export {buildCallerIndex, findRenderPaths, hasNode, isRenderReachable, DEFAULT_MAX_PATHS};
export type {CallEdge, CallGraph, FindRenderPathsOptions, FunctionNode};
