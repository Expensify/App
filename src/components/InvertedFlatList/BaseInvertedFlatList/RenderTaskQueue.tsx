const RENDER_DELAY = 500;

type RenderInfo = {
    distanceFromStart: number;
};

class RenderTaskQueue {
    private renderInfos: RenderInfo[] = [];

    private isRendering = false;

    private handler: ((info: RenderInfo) => void) | undefined = undefined;

    private timeout: NodeJS.Timeout | null = null;

    private onIsRenderingChange?: (isRendering: boolean) => void;

    constructor(onIsRenderingChange?: (isRendering: boolean) => void) {
        this.onIsRenderingChange = onIsRenderingChange;
    }

    add(info: RenderInfo, startRendering = true) {
        this.renderInfos.push(info);

        if (!this.isRendering && startRendering) {
            this.renderWithDelay();
        }
    }

    start() {
        if (this.isRendering) {
            return;
        }
        this.renderWithDelay();
    }

    setHandler(handler: (info: RenderInfo) => void) {
        this.handler = handler;
    }

    cancel() {
        this.isRendering = false;
        if (this.timeout == null) {
            return;
        }
        clearTimeout(this.timeout);
        this.onIsRenderingChange?.(false);
    }

    private renderWithDelay() {
        this.timeout = setTimeout(() => {
            this.render();
        }, RENDER_DELAY);
    }

    private render() {
        const info = this.renderInfos.shift();
        if (!info) {
            this.isRendering = false;
            this.onIsRenderingChange?.(false);
            return;
        }
        this.isRendering = true;
        this.onIsRenderingChange?.(true);

        this.handler?.(info);

        this.renderWithDelay();
    }
}

export default RenderTaskQueue;
export type {RenderInfo};
