import React, { useCallback, useRef } from "react";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  BackgroundVariant,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import ResizableNodeSelected from "./ResizableNodeSelected";
import FloatingEdge from "./FloatingEdge";
import { MarkerType } from "@xyflow/react";
import { ConnectionMode } from "@xyflow/react";
import { getIncomers } from "@xyflow/react";
import { getConnectedEdges } from "@xyflow/react";
import { getOutgoers } from "@xyflow/react";
import { reconnectEdge } from "@xyflow/react";
import { useState } from "react";
import FloatingConnectionLine from "./FloatingConnectionLine";
import Diamond from "./Diamond";

const initialNodes = [
  {
    id: "0",
    type: "Diamond",
    data: { label: "Sou um Losangolo" },
    position: { x: 0, y: 50 },
  },
  {
    id: "1",
    type: "ResizableNodeSelected",
    data: { label: "opa deu certo" },
    position: { x: 0, y: 300 },
  },
];

const nodeOrigin = [0.5, 0];
export default function App() {
  const reactFlowWrapper = useRef(null);
  const edgeReconnectSuccessful = useRef(true);
  const edgeDelete = useRef();

  const [nodes, _, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "e0-1",
      source: "0",
      target: "1",
      label: "This edge can only be updated from source",
      reconnectable: "source",
      type: "FloatingEdge",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ]);
  const [rfInstance, setRfInstance] = useState(null);
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "FloatingEdge",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    []
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);

  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge)
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
    },
    [nodes, edges]
  );
  return (
    <div
      className="simple-floatingedges"
      style={{
        width: "100vw",
        height: "100vh",
        color: "#222",
      }}
      ref={reactFlowWrapper}
    >
      <button
        onClick={() => {
          const flow = rfInstance.toObject();
          console.log("flow", flow);
        }}
      >
        Imprimir estrutura
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={onReconnect}
        onReconnectStart={onReconnectStart}
        onReconnectEnd={onReconnectEnd}
        onNodesDelete={onNodesDelete}
        deleteKeyCode={["Delete"]}
        onConnect={onConnect}
        onEdgeMouseEnter={(e) => (edgeDelete.current = e)}
        fitView
        snapToGrid
        onInit={setRfInstance}
        nodeTypes={{ ResizableNodeSelected, Diamond }}
        edgeTypes={{ FloatingEdge }}
        connectionMode={ConnectionMode.Loose}
        connectionLineComponent={FloatingConnectionLine}
        fitViewOptions={{ padding: 4 }}
        nodeOrigin={nodeOrigin}
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
