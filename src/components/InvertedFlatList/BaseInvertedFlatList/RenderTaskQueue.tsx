const RENDER_DELAY = 500;

type RenderInfo = {
    distanceFromStart: number;
};

class RenderTaskQueue {
    private renderInfos: RenderInfo[] = [];

    private isRendering = false;

    private handler: ((info: RenderInfo) => void) | undefined = undefined;

    private onEndReached: (() => void) | undefined = undefined;

    private timeout: NodeJS.Timeout | null = null;

    add(info: RenderInfo, startRendering = true) {
        this.renderInfos.push(info);

        if (!this.isRendering && startRendering) {
            this.render();
        }
    }

    start() {
        this.render();
    }

    setHandler(handler: (info: RenderInfo) => void) {
        this.handler = handler;
    }

    setOnEndReached(onEndReached: (() => void) | undefined) {
        this.onEndReached = onEndReached;
    }

    cancel() {
        this.isRendering = false;
        if (this.timeout == null) {
            return;
        }
        clearTimeout(this.timeout);
    }

    private render() {
        const info = this.renderInfos.shift();
        if (!info) {
            this.onEndReached?.();
            this.isRendering = false;
            return;
        }
        this.isRendering = true;

        this.handler?.(info);

        this.timeout = setTimeout(() => {
            this.render();
        }, RENDER_DELAY);
    }
}

export default RenderTaskQueue;
export type {RenderInfo};
