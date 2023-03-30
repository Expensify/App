function applyStrikethrough(html, isPendingDelete) {
    if (isPendingDelete) {
        return `<del>${html}</del>`;
    }
    return html;
}

export default applyStrikethrough;
