
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

  const handleFieldChange = useCallback((id, key, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                [key]: value,
                onChange: (k, v) => handleFieldChange(id, k, v),
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
        taskId: `task${id - 1}`,
        taskName: `test_{contractid}.sh`,
        memThread: '100&10',
        params: '',
        onChange: (key, value) => handleFieldChange(newId, key, value),
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

const exportFlowJson = () => {
  // 获取所有有效的 node id
  const validNodeIds = new Set(nodes.map((n) => n.id))

  // 过滤掉无效的边
  const filteredEdges = edges.filter(
    (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
  )

  const data = {
    nodes: nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onChange: undefined,
      },
    })),
    edges: filteredEdges,
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

      // 计算最大 ID 数值部分
      const maxIdNum = parsed.nodes.reduce((max, n) => {
        const match = n.id.match(/^node_(\d+)$/)
        const num = match ? parseInt(match[1]) : -1
        return Math.max(max, num)
      }, -1)
      id = maxIdNum + 1  // ✅ 更新全局 ID 计数器，防止冲突

      const restoredNodes = parsed.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onChange: (k, v) => handleFieldChange(n.id, k, v),
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
        fitView
        dragHandle=".drag-handle"   // ✅ 关键：指定允许拖动的 CSS 类名
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  )
}

export default App
