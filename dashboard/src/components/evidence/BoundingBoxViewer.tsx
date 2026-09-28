import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { BoundingBox } from '../../types/compliance';

interface BoundingBoxViewerProps {
  imageSrc: string;
  boundingBoxes: BoundingBox[];
  selectedBoxId: string | null;
  onSelectBox: (boxId: string | null) => void;
  productName: string;
}

export const BoundingBoxViewer: React.FC<BoundingBoxViewerProps> = ({
  imageSrc,
  boundingBoxes,
  selectedBoxId,
  onSelectBox,
  productName
}) => {
  const [zoom, setZoom] = useState(1);
  const [filterMode, setFilterMode] = useState<'all' | 'fail' | 'pass'>('all');
  const [showLabels, setShowLabels] = useState(true);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const visibleBoxes = boundingBoxes.filter(box => {
    if (filterMode === 'all') return true;
    if (filterMode === 'fail') return box.status === 'FAIL';
    if (filterMode === 'pass') return box.status === 'PASS';
    return true;
  });

  const getBoxColors = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return {
        border: 'stroke-indigo-600 stroke-[3px]',
        bg: 'fill-indigo-600/25',
        badge: 'bg-indigo-700 text-white'
      };
    }
    switch (status) {
      case 'FAIL':
        return {
          border: 'stroke-rose-600 stroke-[2.5px] stroke-dasharray-[4,2]',
          bg: 'fill-rose-500/15',
          badge: 'bg-rose-600 text-white'
        };
      case 'WARNING':
        return {
          border: 'stroke-amber-500 stroke-[2px]',
          bg: 'fill-amber-500/15',
          badge: 'bg-amber-600 text-white'
        };
      case 'PASS':
      default:
        return {
          border: 'stroke-emerald-500 stroke-[2px]',
          bg: 'fill-emerald-500/10',
          badge: 'bg-emerald-600 text-white'
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Layer Controls:</span>
          
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                filterMode === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({boundingBoxes.length})
            </button>
            <button
              onClick={() => setFilterMode('fail')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                filterMode === 'fail' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Violations ({boundingBoxes.filter(b => b.status === 'FAIL').length})
            </button>
            <button
              onClick={() => setFilterMode('pass')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                filterMode === 'pass' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Compliant ({boundingBoxes.filter(b => b.status === 'PASS').length})
            </button>
          </div>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1.5 rounded-lg border transition ${
              showLabels ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={showLabels ? 'Hide Labels' : 'Show Labels'}
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1.5">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-slate-950/60 min-h-[380px]">
        <div 
          className="relative transition-transform duration-150 select-none"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {/* Base Product Package Image */}
          <img
            src={imageSrc}
            alt={productName}
            className="max-w-[420px] w-full rounded-xl shadow-2xl border border-slate-700/60 pointer-events-none"
          />

          {/* SVG Overlay for Bounding Boxes */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-auto"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {visibleBoxes.map((box) => {
              const isSelected = selectedBoxId === box.id;
              const styles = getBoxColors(box.status, isSelected);

              return (
                <g 
                  key={box.id} 
                  className="cursor-pointer group"
                  onClick={() => onSelectBox(isSelected ? null : box.id)}
                >
                  {/* Outer Pulsing Aura if selected */}
                  {isSelected && (
                    <rect
                      x={box.x - 1}
                      y={box.y - 1}
                      width={box.width + 2}
                      height={box.height + 2}
                      rx="1"
                      className="stroke-indigo-400/80 stroke-1 fill-none animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Bounding Box Rectangle */}
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    rx="1"
                    className={`${styles.border} ${styles.bg} transition-all duration-200 group-hover:stroke-indigo-400`}
                  />

                  {/* Corner Targets */}
                  <circle cx={box.x} cy={box.y} r="0.8" className="fill-white" />
                  <circle cx={box.x + box.width} cy={box.y} r="0.8" className="fill-white" />
                  <circle cx={box.x} cy={box.y + box.height} r="0.8" className="fill-white" />
                  <circle cx={box.x + box.width} cy={box.y + box.height} r="0.8" className="fill-white" />
                </g>
              );
            })}
          </svg>

          {/* HTML Overlay for Box Badges */}
          {showLabels && visibleBoxes.map((box) => {
            const isSelected = selectedBoxId === box.id;
            const styles = getBoxColors(box.status, isSelected);

            return (
              <div
                key={`badge-${box.id}`}
                onClick={() => onSelectBox(isSelected ? null : box.id)}
                style={{
                  position: 'absolute',
                  left: `${box.x}%`,
                  top: `${Math.max(2, box.y - 4)}%`,
                  transform: 'translateY(-50%)'
                }}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md cursor-pointer whitespace-nowrap transition-transform duration-150 hover:scale-105 flex items-center gap-1 z-10 ${
                  styles.badge
                }`}
              >
                {box.status === 'FAIL' ? (
                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <CheckCircle className="w-2.5 h-2.5 shrink-0" />
                )}
                <span>{box.rule}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions footer */}
      <div className="bg-slate-950 px-4 py-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-500" />
          Click any bounding box to inspect OCR text &amp; statutory compliance parameters
        </span>
        <span className="font-mono text-slate-500 text-[10px]">
          Resolution: 1200 DPI Optical Normalization
        </span>
      </div>

    </div>
  );
};
