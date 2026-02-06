const RENDER_DELAY = 500;

type RenderInfo = {
    distanceFromStart: number;
};

class RenderTaskQueue {
    private renderInfos: RenderInfo[] = [];

    private isRendering = false;

    private handler: (info: RenderInfo) => void = () => {};

    private timeout: NodeJS.Timeout | null = null;

    private onIsRenderingChange?: (isRendering: boolean) => void;

    constructor(onIsRenderingChange?: (isRendering: boolean) => void) {
        this.onIsRenderingChange = onIsRenderingChange;
    }

    add(info: RenderInfo) {
        this.renderInfos.push(info);

        if (!this.isRendering) {
            this.render();
        }
    }

    setHandler(handler: (info: RenderInfo) => void) {
        this.handler = handler;
    }

    cancel() {
        if (this.timeout == null) {
            return;
        }
        clearTimeout(this.timeout);
        this.onIsRenderingChange?.(false);
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

        this.handler(info);

        this.timeout = setTimeout(() => {
            this.render();
        }, RENDER_DELAY);
    }
}

export default RenderTaskQueue;
