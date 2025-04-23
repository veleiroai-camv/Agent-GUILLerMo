import { type EdgeProps, getBezierPath, EdgeLabelRenderer } from "reactflow"

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style = {},
}: EdgeProps) {
  const isConditional = data?.isConditional || false
  const label = data?.label || ""

  // Get the path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Apply conditional styling (dashed line)
  const edgeStyle = {
    ...style,
    strokeDasharray: isConditional ? "5,5" : "none",
    stroke: isConditional ? "#888" : "#555",
    strokeWidth: 2,
  }

  return (
    <>
      <path id={id} style={edgeStyle} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              fontSize: 12,
              fontWeight: 500,
            }}
            className="nodrag nopan border border-gray-200 px-1.5 py-0.5 rounded bg-white/75 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
