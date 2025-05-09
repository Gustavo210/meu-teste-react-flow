import { memo } from "react";
import {
  Handle,
  Position,
  NodeResizer,
  NodeToolbar,
  useConnection,
  useReactFlow,
} from "@xyflow/react";
import { useState } from "react";
import { MarkerType } from "@xyflow/react";

const ResizableNodeSelected = ({ data, selected, isConnectable, id }) => {
  const connection = useConnection();
  const { getNode, addNodes, addEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || "Node");
  const isTarget = connection.inProgress && connection.fromNode?.id !== id;

  function createNewNode() {
    try {
      const currentNode = getNode(id);

      if (!currentNode) {
        console.error("Nó atual não encontrado");
        return;
      }

      const nodeWidth = currentNode.width || 150;
      const nodeHeight = currentNode.height || 50;
      const nodeX = currentNode.position?.x || 0;
      const nodeY = currentNode.position?.y || 0;

      const newId = `node_${Date.now()}`;

      const newNode = {
        id: newId,
        type: "ResizableNodeSelected",
        position: {
          x: nodeX + nodeWidth + 50,
          y: nodeY,
        },
        data: {
          label: `Novo node ${newId.slice(-4)}`,
        },
        width: nodeWidth,
        height: nodeHeight,
      };

      console.log("Adicionando novo nó:", newNode);

      addNodes(newNode);

      const newEdge = {
        id: `edge-${id}-${newId}`,
        source: id,
        target: newId,
        type: "FloatingEdge",
        markerEnd: { type: MarkerType.ArrowClosed },
      };

      addEdges(newEdge);
    } catch (error) {
      console.error("Erro ao criar novo nó:", error);
    }
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <NodeToolbar isVisible={selected} position={Position.Bottom}>
        <button onClick={createNewNode}>+</button>
      </NodeToolbar>

      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />

      {isEditing ? (
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            if (data) data.label = label;
          }}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: "8px",
          }}
          autoFocus
        />
      ) : (
        <div
          style={{
            padding: 10,
            height: "100%",
            width: "100%",
            boxSizing: "border-box",
          }}
          onDoubleClick={() => setIsEditing(true)}
        >
          {label}
        </div>
      )}

      {!connection.inProgress && (
        <Handle
          position={Position.Right}
          type="source"
          style={{ background: "#555" }}
          isConnectable={isConnectable}
        />
      )}

      {(!connection.inProgress || isTarget) && (
        <Handle
          className="customHandle"
          position={Position.Left}
          type="target"
          isConnectableStart={false}
          style={{ background: "#555" }}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
};

export default memo(ResizableNodeSelected);
