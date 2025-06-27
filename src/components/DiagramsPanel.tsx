import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Eraser, Square, Circle, Minus, Type, Download, Trash2, Undo, Redo, Move, Pen } from 'lucide-react';
import { Note } from '../types';

interface DiagramsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
}

interface Drawing {
  id: string;
  name: string;
  data: string;
  createdAt: Date;
}

interface DrawingState {
  imageData: string;
  timestamp: number;
}

export const DiagramsPanel: React.FC<DiagramsPanelProps> = ({
  isOpen,
  onClose,
  note,
  onUpdateNote,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text' | 'move'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingState[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingState[]>([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    if (note && note.id) {
      const savedDrawings = localStorage.getItem(`drawings-${note.id}`);
      if (savedDrawings) {
        setDrawings(JSON.parse(savedDrawings));
      }
    }
  }, [note]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    setUndoStack(prev => [...prev.slice(-9), { imageData, timestamp: Date.now() }]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentState = canvas.toDataURL();
    const previousState = undoStack[undoStack.length - 1];
    
    setRedoStack(prev => [...prev, { imageData: currentState, timestamp: Date.now() }]);
    setUndoStack(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousState.imageData;
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentState = canvas.toDataURL();
    const nextState = redoStack[redoStack.length - 1];
    
    setUndoStack(prev => [...prev, { imageData: currentState, timestamp: Date.now() }]);
    setRedoStack(prev => prev.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = nextState.imageData;
  };

  const saveDrawing = (name: string, data: string) => {
    if (!note) return;
    
    const newDrawing: Drawing = {
      id: Date.now().toString(),
      name,
      data,
      createdAt: new Date(),
    };
    
    const updatedDrawings = [...drawings, newDrawing];
    setDrawings(updatedDrawings);
    localStorage.setItem(`drawings-${note.id}`, JSON.stringify(updatedDrawings));
  };

  const deleteDrawing = (id: string) => {
    if (!note) return;
    
    const updatedDrawings = drawings.filter(d => d.id !== id);
    setDrawings(updatedDrawings);
    localStorage.setItem(`drawings-${note.id}`, JSON.stringify(updatedDrawings));
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);
    
    saveCanvasState();
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setCurrentPath([pos]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePos(e);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    switch (tool) {
      case 'pen':
      case 'eraser':
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setCurrentPath(prev => [...prev, pos]);
        break;
        
      case 'line':
      case 'rectangle':
      case 'circle':
        // Clear and redraw for shape tools
        const imageData = undoStack[undoStack.length - 1];
        if (imageData) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            drawShape(ctx, startPos, pos);
          };
          img.src = imageData.imageData;
        }
        break;
    }
  };

  const drawShape = (ctx: CanvasRenderingContext2D, start: {x: number, y: number}, end: {x: number, y: number}) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    switch (tool) {
      case 'line':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
        
      case 'rectangle':
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.rect(start.x, start.y, width, height);
        break;
        
      case 'circle':
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        break;
    }
    
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    saveCanvasState();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCurrentDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    const name = prompt('Enter a name for this drawing:');
    if (name) {
      saveDrawing(name, dataURL);
    }
  };

  const loadDrawing = (data: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    saveCanvasState();
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = data;
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Palette className="text-white" size={20} />
          <h2 className="text-lg font-semibold">Diagrams & Drawings</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Enhanced Tools */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Pen"
          >
            <Pen size={16} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Eraser"
          >
            <Eraser size={16} />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'line' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Line"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => setTool('rectangle')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'rectangle' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Rectangle"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'circle' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Circle"
          >
            <Circle size={16} />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'text' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Text"
          >
            <Type size={16} />
          </button>
        </div>

        {/* Color Palette */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Colors:</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded border-2 ${color === c ? 'border-gray-800' : 'border-gray-300'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-8 rounded border border-gray-300"
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-6">{lineWidth}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Redo size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearCanvas}
            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={saveCurrentDrawing}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={downloadDrawing}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Enhanced Canvas */}
      <div className="p-4 border-b border-gray-200">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="border border-gray-300 rounded-lg cursor-crosshair bg-white shadow-sm"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Saved Drawings */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="font-medium mb-3">Saved Drawings</h3>
        {drawings.length === 0 ? (
          <p className="text-gray-500 text-sm">No drawings saved yet</p>
        ) : (
          <div className="space-y-3">
            {drawings.map((drawing) => (
              <div key={drawing.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{drawing.name}</h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadDrawing(drawing.data)}
                      className="p-1 hover:bg-gray-100 rounded text-blue-600"
                      title="Load drawing"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => deleteDrawing(drawing.id)}
                      className="p-1 hover:bg-gray-100 rounded text-red-600"
                      title="Delete drawing"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <img
                  src={drawing.data}
                  alt={drawing.name}
                  className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => loadDrawing(drawing.data)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {drawing.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};