package com.margelo.nitro.utils

/** Android lays no bar out along a side edge, so the edge is never specified and never changes. */
class HybridVerticalBarModule : HybridVerticalBarModuleSpec() {
    override val memorySize: Long = 0L

    override val edge: VerticalBarEdge = VerticalBarEdge.UNSPECIFIED

    override fun addEdgeListener(onChange: (edge: VerticalBarEdge) -> Unit): () -> Unit = {}
}
