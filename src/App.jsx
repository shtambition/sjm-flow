
import React, { useCallback, useEffect, useState, useRef } from 'react'
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import CustomNode from './CustomNode'
import 'reactflow/dist/style.css'
import './App.css'

const nodeTypes = {
  custom: CustomNode,
}

function FlowContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState([])
  const [selectedEdges, setSelectedEdges] = useState([])
  const { project } = useReactFlow()

  // 使用 useRef 管理节点 ID 计数器，避免全局变量
  const nodeIdCounter = useRef(0)
  const getNodeId = useCallback(() => `node_${nodeIdCounter.current++}`, [])

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

  const addNode = useCallback(() => {
    const newId = getNodeId()
    const currentTaskNum = nodeIdCounter.current - 1

    // 获取画布可视区域的中心位置（屏幕坐标）
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    // 将屏幕坐标转换为流程图坐标
    const position = project({ x: centerX, y: centerY })

    // 添加随机偏移避免所有节点叠在一起
    const randomOffsetX = (Math.random() - 0.5) * 200
    const randomOffsetY = (Math.random() - 0.5) * 200

    const newNode = {
      id: newId,
      type: 'custom',
      position: {
        x: position.x + randomOffsetX,
        y: position.y + randomOffsetY
      },
      data: {
        taskId: `task${currentTaskNum}`,
        taskName: `test_{contractid}.sh`,
        memThread: '100&10',
        params: '',
        onChange: (key, value) => handleFieldChange(newId, key, value),
      },
    }
    setNodes((nds) => [...nds, newNode])
  }, [getNodeId, project, handleFieldChange, setNodes])

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


  const importFlowJson = useCallback((e) => {
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
        nodeIdCounter.current = maxIdNum + 1  // 更新 ID 计数器，防止冲突

        const restoredNodes = parsed.nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            onChange: (k, v) => handleFieldChange(n.id, k, v),
          },
        }))

        // 导入的边使用默认配置，让 CSS 类控制样式
        const restoredEdges = (parsed.edges || []).map((e) => ({
          ...e,
          interactionWidth: 20,
        }))

        setNodes(restoredNodes)
        setEdges(restoredEdges)
      } catch (err) {
        alert('导入失败，JSON格式错误')
      }
    }
    reader.readAsText(file)
  }, [handleFieldChange, setNodes, setEdges])


  const isInputFocused = useCallback(() => {
    const active = document.activeElement
    return (
      active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.getAttribute('contenteditable') === 'true')
    )
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputFocused()) {
        setNodes((nds) => nds.filter((n) => !selectedNodes.some((sn) => sn.id === n.id)))
        setEdges((eds) => eds.filter((e) => !selectedEdges.some((se) => se.id === e.id)))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodes, selectedEdges, setNodes, setEdges, isInputFocused])

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            interactionWidth: 20,
          },
          eds
        )
      ),
    [setEdges]
  )

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
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
        <Controls position="bottom-left" />
        <Background />
      </ReactFlow>
    </div>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  )
}

export default App
