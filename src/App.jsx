import React, { useCallback, useRef } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import ResizableNodeSelected from './ResizableNodeSelected';
import Triangule from './Triangule';
import FloatingEdge from './FloatingEdge';
import { MarkerType } from '@xyflow/react';
import { useEffect } from 'react';
import { ConnectionMode } from '@xyflow/react';
import { getIncomers } from '@xyflow/react';
import { getConnectedEdges } from '@xyflow/react';
import { getOutgoers } from '@xyflow/react';
import { reconnectEdge } from '@xyflow/react';
import { useState } from 'react';


const initialNodes = [
  {
    id: '0',
    type: 'Triangule',
    data: { label: "escolhe ai" },
    position: { x: 0, y: 50 },
  },
  {
    id: '1',
    type: 'ResizableNodeSelected',
    data: { label: "opa deu certo" },
    position: { x: 0, y: 150 }
  }
];

let id = 2;
const getId = () => `${id++}`;
const nodeOrigin = [0.5, 0];
export default function App() {
  const reactFlowWrapper = useRef(null);
  const edgeReconnectSuccessful = useRef(true);
  const edgeDelete = useRef()

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState(null);
  const { screenToFlowPosition } = useReactFlow();
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'FloatingEdge',
      markerEnd: { type: MarkerType.Arrow }
    }, eds)),
    [],
  );
  const onConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          type: "ResizableNodeSelected",
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode.id, target: id }),
        );
      }
    },
    [screenToFlowPosition],
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
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );
  return (
    <div className="simple-floatingedges" style={{
      width: "100vw",
      height: "100vh",
      color: "#222"
    }} ref={reactFlowWrapper}>
      <button onClick={() => {
        const flow = rfInstance.toObject();
        console.log("flow", flow)
      }}>TESTE</button>
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
        onEdgeMouseEnter={e => edgeDelete.current = e}
        fitView
        onInit={setRfInstance}
        nodeTypes={{ ResizableNodeSelected, Triangule }}
        edgeTypes={{ FloatingEdge }}
        connectionMode={ConnectionMode.Loose}
        fitViewOptions={{ padding: 4 }}
        nodeOrigin={nodeOrigin}
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};
