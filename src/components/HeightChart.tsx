import React, { useState } from 'react';
import { Character } from '../types';
import { ExternalLink, MoveHorizontal } from 'lucide-react';
import CharacterDetailDrawer from './CharacterDetailDrawer';
import { motion, Reorder } from 'motion/react';
import { db } from '../firebase';
import { doc, writeBatch } from 'firebase/firestore';

interface Props {
  characters: Character[];
}

type SortOption = 'custom' | 'height' | 'gender' | 'name';

export default function HeightChart({ characters }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>('custom');
  const [filterSeries, setFilterSeries] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (characters.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        인물을 추가하면 여기에 키 비교 차트가 표시됩니다.
      </div>
    );
  }

  // Handle background click to deselect
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  };

  const uniqueSeries = Array.from(new Set(characters.map(c => c.series).filter(Boolean) as string[]));

  const filteredCharacters = characters.filter(c => {
    if (filterSeries === 'all') return true;
    if (filterSeries === 'none') return !c.series;
    return c.series === filterSeries;
  });

  const sortedCharacters = [...filteredCharacters].sort((a, b) => {
    if (sortBy === 'height') return a.height - b.height;
    if (sortBy === 'gender') return a.gender.localeCompare(b.gender);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // Default to 'custom' order
    return (a.order ?? 0) - (b.order ?? 0);
  });

  const handleReorder = async (newOrder: Character[]) => {
    if (sortBy !== 'custom') return;
    
    // Update local state immediately for smooth UI
    // (Though App.tsx will eventually update it from Firestore)
    
    try {
      const batch = writeBatch(db);
      newOrder.forEach((char, index) => {
        const docRef = doc(db, 'characters', char.id);
        batch.update(docRef, { order: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const PIXELS_PER_CM = 2.5;
  
  // Determine grid lines dynamically based on min/max height
  const minHeight = Math.min(...filteredCharacters.map(c => c.height), 150);
  const maxHeight = Math.max(...filteredCharacters.map(c => c.height), 180);
  
  const startGrid = Math.floor((minHeight - 10) / 10) * 10;
  const endGrid = Math.ceil(maxHeight / 10) * 10;
  
  const gridLines = [];
  for (let h = startGrid; h <= endGrid; h += 10) {
    // Only add grid lines that fit within the container
    if (h * PIXELS_PER_CM <= maxHeight * PIXELS_PER_CM + 34) {
      gridLines.push(h);
    }
  }

  // 가장 큰 캐릭터의 픽셀 높이 + 머리 위 라벨 공간(약 28px) + 여백 6px = 34px
  const containerHeight = maxHeight * PIXELS_PER_CM + 34;

  return (
    <div className="w-full flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">시리즈:</span>
          <select 
            value={filterSeries} 
            onChange={(e) => setFilterSeries(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">전체 보기</option>
            {uniqueSeries.map(series => (
              <option key={series} value={series}>{series}</option>
            ))}
            <option value="none">시리즈 없음</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 mr-1">정렬:</span>
          <button 
            onClick={() => setSortBy('custom')}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors flex items-center gap-1 ${sortBy === 'custom' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <MoveHorizontal size={12} />
            사용자 지정
          </button>
          <button 
            onClick={() => setSortBy('height')}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${sortBy === 'height' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            키
          </button>
          <button 
            onClick={() => setSortBy('gender')}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${sortBy === 'gender' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            성별
          </button>
          <button 
            onClick={() => setSortBy('name')}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${sortBy === 'name' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            이름
          </button>
        </div>
      </div>

      <div 
        className="w-full overflow-x-auto pb-12 pt-12 px-4 flex-grow"
        onClick={handleBackgroundClick}
      >
        <Reorder.Group 
          axis="x"
          values={sortedCharacters}
          onReorder={handleReorder}
          className="relative min-w-max flex items-end space-x-12 px-12 border-b-2 border-gray-400 mx-auto"
          onClick={handleBackgroundClick}
          style={{ height: `${containerHeight}px` }}
        >
        
        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {gridLines.map(h => {
            const bottomPos = h * PIXELS_PER_CM;
            return (
              <div 
                key={h} 
                className="absolute w-full border-t border-dashed border-gray-200 flex items-center"
                style={{ bottom: `${bottomPos}px` }}
              >
                <span className="text-xs text-gray-400 bg-white pr-2 -mt-3 absolute left-0">{h}cm</span>
              </div>
            );
          })}
        </div>

        {/* Characters */}
        {sortedCharacters.map(char => {
          const heightPx = char.height * PIXELS_PER_CM;
          const isSelected = selectedId === char.id;
          
          return (
            <Reorder.Item 
              key={char.id}
              value={char}
              dragListener={sortBy === 'custom'}
              role="button"
              tabIndex={0}
              className={`flex flex-col items-center justify-end group relative cursor-grab active:cursor-grabbing z-10 transition-all outline-none ${isSelected ? '-translate-y-2 scale-105' : 'hover:-translate-y-1'}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(char.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedId(char.id);
                }
              }}
            >
              {/* Height Label above head */}
              <span className={`text-sm font-bold mb-2 bg-white/80 px-1 rounded transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>{char.height}</span>

              {/* Figure */}
              <div className="flex flex-col items-center justify-end pointer-events-none" style={{ height: `${heightPx}px` }}>
                {/* Head */}
                <div 
                  className={`rounded-full flex-shrink-0 shadow-sm relative z-10 transition-all ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                  style={{ 
                    width: char.gender === 'male' ? '32px' : '28px', 
                    height: char.gender === 'male' ? '32px' : '28px', 
                    backgroundColor: char.color,
                    opacity: isSelected ? 1 : 0.8
                  }}
                />
                
                {/* Body */}
                <div 
                  className="flex-grow shadow-sm relative mt-1 transition-all"
                  style={{ 
                    backgroundColor: char.color, 
                    width: char.gender === 'male' ? '54px' : '46px',
                    clipPath: char.gender === 'male' 
                      ? 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' // Broad shoulders, narrow waist
                      : 'polygon(25% 0, 75% 0, 100% 100%, 0 100%)', // Narrow shoulders, wide hips/skirt
                    opacity: isSelected ? 1 : 0.8
                  }}
                />
              </div>

              {/* Name Label below */}
              <div className="absolute top-full mt-3 text-center w-32 left-1/2 -translate-x-1/2 pointer-events-none">
                <p className={`font-semibold truncate flex items-center justify-center gap-1 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                  {char.name}
                  {char.notionUrl && <ExternalLink size={12} className={isSelected ? 'text-blue-600' : 'text-blue-500'} />}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {char.gender === 'male' ? '남성' : '여성'}
                  {char.series && <span className="block text-[10px] text-gray-400 truncate mt-0.5">{char.series}</span>}
                </p>
              </div>
            </Reorder.Item>
          );
        })}
        </Reorder.Group>
      </div>

      {/* Character Detail Drawer */}
      <CharacterDetailDrawer 
        character={characters.find(c => c.id === selectedId) || null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
