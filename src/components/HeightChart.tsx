import React, { useState, useRef } from 'react';
import { Character } from '../types';
import { ExternalLink, MoveHorizontal } from 'lucide-react';
import CharacterDetailDrawer from './CharacterDetailDrawer';
import { motion, Reorder } from 'motion/react';
import ObjectVisual from './ObjectVisual';

interface Props {
  characters: Character[];
  onUpdate?: (character: Character) => void;
  onReorder?: (newOrder: Character[]) => void;
  highlightedIds?: string[] | null;
}

type SortOption = 'custom' | 'height' | 'gender' | 'name';

const PIXELS_PER_CM = 3.0; // Slightly reduced to fit better vertically

interface DraggableObjectProps {
  obj: Character;
  index: number;
  characterCount: number;
  latestCharacterHeight: number;
  chartAreaRef: React.RefObject<HTMLDivElement>;
  isFaded?: boolean;
}

const DraggableObject: React.FC<DraggableObjectProps> = ({ obj, index, characterCount, latestCharacterHeight, chartAreaRef, isFaded }) => {
  const heightPx = obj.height * PIXELS_PER_CM;
  const widthPx = (obj.width || 50) * PIXELS_PER_CM;
  
  // Calculate starting X position to overlap behind the last character
  // Container has px-32 (128px). Characters have ~72px width and space-x-20 (80px).
  const charIndex = Math.max(0, characterCount - 1);
  const approximateCharCenter = 128 + (charIndex * 152) + 36;
  const startXPx = (obj.id === 'obj-car' || obj.id === 'obj-chalkboard') 
    ? 32 + (index * 40) // Align to left edge for wide objects, with slight offset per object
    : approximateCharCenter - (widthPx / 2) + (index * 20);
  
  // Special case for bed: free dragging (horizontal and vertical)
  const isBed = obj.id === 'obj-bed';
  
  let bottomPx = (obj.yOffset || 0) * PIXELS_PER_CM + 60; // Offset by ground position (60px)
  
  if (isBed) {
    // Top of bed (pillow) should align with character's head
    // Height of bed top from bottom is obj.height
    // Character head from ground is latestCharacterHeight
    bottomPx = (latestCharacterHeight - obj.height) * PIXELS_PER_CM + 60;
  }

  return (
    <motion.div
      drag={isBed ? true : "x"}
      dragConstraints={chartAreaRef}
      dragElastic={0.05}
      dragMomentum={true}
      onContextMenu={(e) => e.preventDefault()}
      className={`absolute cursor-grab active:cursor-grabbing pointer-events-auto z-10 transition-[opacity,filter] duration-300 ${isFaded ? 'opacity-20 grayscale brightness-110' : 'opacity-100'}`}
      style={{ left: `${startXPx}px`, bottom: `${bottomPx}px`, touchAction: 'none' }}
    >
      <div className="flex flex-col items-center group relative">
        <ObjectVisual 
          id={obj.id} 
          width={widthPx} 
          height={heightPx} 
          color={obj.color} 
          name={obj.name}
        />
      </div>
    </motion.div>
  );
};

export default function HeightChart({ characters, onUpdate, onReorder, highlightedIds }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>('custom');
  const [filterSeries, setFilterSeries] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);

  if (characters.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        인물을 추가하면 여기에 키 비교 차트가 표시됩니다.
      </div>
    );
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  };

  const uniqueSeries = Array.from(new Set(characters.map(c => c.series).filter(Boolean) as string[]));

  const characterList = characters.filter(c => !c.isObject);
  const objectList = characters.filter(c => c.isObject);

  const filteredCharacters = characterList.filter(c => {
    if (filterSeries === 'all') return true;
    if (filterSeries === 'none') return !c.series;
    return c.series === filterSeries;
  });

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    if (sortBy === 'height') return a.height - b.height;
    if (sortBy === 'gender') return a.gender === b.gender ? 0 : a.gender === 'male' ? -1 : 1;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const handleReorder = (newOrder: Character[]) => {
    if (sortBy !== 'custom') return;
    if (onReorder) {
      onReorder(newOrder);
    }
  };

  const allEntities = [...sortedCharacters, ...objectList];
  const maxHeight = allEntities.length > 0 
    ? Math.max(...allEntities.map(c => (c.height + Math.max(0, c.yOffset || 0))))
    : 180;
  const minHeight = allEntities.length > 0
    ? Math.min(...allEntities.map(c => c.height + Math.max(0, c.yOffset || 0)))
    : 0;
  
  // Dynamic width calculation to avoid unnecessary scrolling
  const characterCount = sortedCharacters.length;
  const objectCount = objectList.length;
  const contentWidth = Math.max(characterCount * 160 + objectCount * 300 + 100, 600);

  const startGrid = 0;
  const endGrid = Math.ceil((maxHeight + 20) / 10) * 10;
  
  const gridLines = [];
  for (let h = startGrid; h <= endGrid; h += 10) {
    gridLines.push(h);
  }

  // Adjust container height to be more dynamic
  const groundOffset = 60; // Space for names at the bottom
  const containerHeight = maxHeight * PIXELS_PER_CM + groundOffset + 100;

  return (
    <div className="w-full flex flex-col h-full relative">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-4 z-20">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 font-bold">시리즈 필터:</span>
          <select 
            value={filterSeries} 
            onChange={(e) => setFilterSeries(e.target.value)}
            className="text-sm border border-gray-100 bg-white shadow-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          >
            <option value="all">전체 캐릭터</option>
            {uniqueSeries.map(series => (
              <option key={series} value={series}>{series}</option>
            ))}
            <option value="none">기타 (없음)</option>
          </select>
        </div>

        <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl border border-gray-100">
          <button onClick={() => setSortBy('custom')} className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 ${sortBy === 'custom' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}><MoveHorizontal size={14} />직접 정렬</button>
          <button onClick={() => setSortBy('height')} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${sortBy === 'height' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>키 오름차순</button>
          <button onClick={() => setSortBy('gender')} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${sortBy === 'gender' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>성별 기준</button>
          <button onClick={() => setSortBy('name')} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${sortBy === 'name' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}>이름 오름차순</button>
        </div>
      </div>

      <div className="w-full overflow-x-auto flex-grow relative bg-slate-50/10 custom-scrollbar" onClick={handleBackgroundClick}>
        <div 
          className="relative min-h-full" 
          style={{ 
            height: `${containerHeight}px`, 
            minWidth: `${contentWidth}px`,
            transition: 'height 0.5s ease-out, min-width 0.5s ease-out'
          }}
          ref={chartAreaRef}
        >
          {/* Grid Lines Layer */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="relative w-full h-full">
              {gridLines.map(h => (
                <div key={h} className="absolute w-full border-t border-gray-200/40 flex items-center transition-all duration-700 ease-in-out" style={{ bottom: `${h * PIXELS_PER_CM + groundOffset}px` }}>
                  <span className="text-[10px] font-bold text-gray-300 bg-white/30 px-2 py-0.5 rounded-r -mt-4 absolute left-0 z-10">{h}cm</span>
                </div>
              ))}
            </div>
            {/* Ground Line */}
            <div className="absolute bottom-[56px] w-full border-b-[4px] border-slate-300 z-10" />
            <div className="absolute bottom-0 w-full h-[56px] bg-gray-50/50" />
          </div>

          {/* Draggable Objects Layer (Behind) */}
          <div className="absolute inset-0 z-10">
             {objectList.map((obj, index) => {
               // Calculate latest character height for bed positioning
               const latestChar = sortedCharacters.length > 0 ? sortedCharacters[sortedCharacters.length - 1] : null;
               const latestCharacterHeight = latestChar ? latestChar.height : 170; // 170 as fallback
               const isFaded = highlightedIds !== null && highlightedIds !== undefined && highlightedIds.length > 0 && !highlightedIds.includes(obj.id);
               return (
                 <DraggableObject 
                   key={obj.id}
                   obj={obj}
                   index={index}
                   characterCount={characterCount}
                   latestCharacterHeight={latestCharacterHeight}
                   chartAreaRef={chartAreaRef}
                   isFaded={isFaded}
                 />
               );
             })}
          </div>

          {/* Characters Layer (Front) */}
          <Reorder.Group 
            axis="x"
            values={sortedCharacters}
            onReorder={handleReorder}
            className="flex items-end justify-start space-x-20 px-32 h-full relative z-20 pointer-events-none"
            style={{ paddingBottom: `${groundOffset}px` }}
            onClick={handleBackgroundClick}
          >
            {sortedCharacters.map(char => {
              const isSelected = selectedId === char.id;
              const isFaded = highlightedIds !== null && highlightedIds !== undefined && highlightedIds.length > 0 && !highlightedIds.includes(char.id);
              return (
                <Reorder.Item 
                  key={char.id}
                  value={char}
                  dragListener={sortBy === 'custom'}
                  className={`flex flex-col items-center justify-end group relative cursor-grab active:cursor-grabbing outline-none pointer-events-auto transition-[opacity,filter] duration-300 ${isSelected ? 'z-30' : 'z-20'} ${isFaded ? 'opacity-20 grayscale brightness-110' : 'opacity-100'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(char.id); }}
                >
                  <div className={`flex flex-col items-center justify-end transition-transform duration-300 origin-bottom ${isSelected ? '-translate-y-2' : 'group-hover:-translate-y-2'}`}>
                    <span className={`text-[11px] font-black pb-1.5 transition-all ${isSelected ? 'text-blue-600 drop-shadow-md' : 'text-gray-600'}`}>{char.height}</span>
                    <div className="flex flex-col items-center justify-end pointer-events-none" style={{ height: `${char.height * PIXELS_PER_CM}px` }}>
                      <div 
                        className={`rounded-full flex-shrink-0 shadow-lg relative z-10 transition-all ${isSelected ? 'ring-2 ring-blue-500/30' : ''}`}
                        style={{ 
                          width: char.gender === 'male' ? '46px' : '42px', 
                          height: char.gender === 'male' ? '46px' : '42px', 
                          backgroundColor: char.color,
                          opacity: isSelected ? 1 : 0.95
                        }}
                      />
                      <div 
                        className="flex-grow shadow-2xl relative mt-1 transition-all"
                        style={{ 
                          backgroundColor: char.color, 
                          width: char.gender === 'male' ? '72px' : '62px',
                          clipPath: char.gender === 'male' 
                            ? 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' 
                            : 'polygon(25% 0, 75% 0, 100% 100%, 0 100%)',
                          opacity: isSelected ? 1 : 0.95
                        }}
                      />
                    </div>
                  </div>
                  <div className={`absolute top-[calc(100%+8px)] text-center w-40 left-1/2 -translate-x-1/2 pointer-events-none p-2 rounded-xl transition-all ${isSelected ? 'bg-white shadow-lg ring-1 ring-blue-50' : 'bg-white/30 backdrop-blur-[1px]'}`}>
                    <p className={`font-bold truncate text-sm flex items-center justify-center gap-1.5 transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                      {char.name}
                      {char.notionUrl && <ExternalLink size={14} className={isSelected ? 'text-blue-600' : 'text-blue-400'} />}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">
                      {char.series || (char.gender === 'male' ? 'MALE' : 'FEMALE')}
                    </p>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      </div>

      <CharacterDetailDrawer 
        character={characters.find(c => c.id === selectedId) || null}
        onClose={() => setSelectedId(null)}
        onUpdate={onUpdate}
      />
    </div>
  );
}
