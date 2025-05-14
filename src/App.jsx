import React, { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import CustomNode from './CustomNode'
import 'reactflow/dist/style.css'
import { Analytics } from '@vercel/analytics/react'

let id = 0
const getId = () => `node_${id++}`

const nodeTypes = {
  custom: CustomNode,
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState([])
  const [selectedEdges, setSelectedEdges] = useState([])

  const handleLabelChange = useCallback((id, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                label: value,
                onChange: (v) => handleLabelChange(id, v),
              },
            }
          : node
      )
    )
  }, [setNodes])

  const addNode = () => {
    const newId = getId()
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `Task ${id - 1}`,
        onChange: (val) => handleLabelChange(newId, val),
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const exportFlowJson = () => {
    const data = {
      nodes: nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onChange: undefined, // 去掉函数，避免 JSON 序列化失败
        },
      })),
      edges,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flow.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFlowJson = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        // 恢复函数
        const restoredNodes = parsed.nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            onChange: (val) => handleLabelChange(n.id, val),
          },
        }))
        setNodes(restoredNodes)
        setEdges(parsed.edges || [])
      } catch (err) {
        alert('导入失败，JSON格式错误')
      }
    }
    reader.readAsText(file)
  }

  const isInputFocused = () => {
    const active = document.activeElement
    return (
      active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.getAttribute('contenteditable') === 'true')
    )
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputFocused()) {
        setNodes((nds) => nds.filter((n) => !selectedNodes.some((sn) => sn.id === n.id)))
        setEdges((eds) => eds.filter((e) => !selectedEdges.some((se) => se.id === e.id)))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodes, selectedEdges])

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            markerEnd: { type: 'arrowclosed' },
            style: { stroke: '#0077cc', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  )

  // Prevent node drag when input is focused
  const onNodeDragStart = (event, node) => {
    if (isInputFocused()) {
      event.preventDefault()  // 禁止拖动节点
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button onClick={addNode} style={{ position: 'absolute', zIndex: 10, top: 10, left: 10 }}>
        ➕ 添加节点
      </button>

      <button onClick={exportFlowJson} style={{ position: 'absolute', zIndex: 10, top: 60, left: 10 }}>
        📤 导出 JSON
      </button>

      <input
        id="import-json"
        type="file"
        accept=".json"
        onChange={importFlowJson}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => document.getElementById('import-json').click()}
        style={{ position: 'absolute', zIndex: 10, top: 110, left: 10 }}
      >
        📥 导入 JSON
      </button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={({ nodes, edges }) => {
          setSelectedNodes(nodes)
          setSelectedEdges(edges)
        }}
        onNodeDragStart={onNodeDragStart}  // 禁用拖动行为
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    <Analytics />  {/* ✅ 加在最底部即可 */}
    </div>
  )
}

export default App
