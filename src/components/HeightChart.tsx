import React, { useState } from 'react';
import { Character } from '../types';
import { ExternalLink } from 'lucide-react';

interface Props {
  characters: Character[];
}

type SortOption = 'added' | 'height' | 'gender' | 'name';

export default function HeightChart({ characters }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>('added');
  const [filterSeries, setFilterSeries] = useState<string>('all');

  if (characters.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        인물을 추가하면 여기에 키 비교 차트가 표시됩니다.
      </div>
    );
  }

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
    return 0;
  });
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
            onClick={() => setSortBy('added')}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${sortBy === 'added' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            추가순
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

      <div className="w-full overflow-x-auto pb-12 pt-12 px-4 flex-grow">
        <div 
          className="relative min-w-max flex items-end space-x-12 px-12 border-b-2 border-gray-400 mx-auto"
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
          
          const CharacterBody = (
            <div className="flex flex-col items-center justify-end group relative cursor-pointer z-10 transition-transform hover:-translate-y-1">
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-2xl z-50 left-1/2 -translate-x-1/2">
                <div className="font-bold text-lg mb-1 flex items-center justify-between">
                  <span>{char.name}</span>
                  <span className="text-gray-300 text-sm font-normal bg-gray-800 px-2 py-1 rounded-md">{char.height}cm</span>
                </div>
                {char.description ? (
                  <p className="text-gray-300 text-sm leading-relaxed border-t border-gray-700 pt-3 mt-2">
                    {char.description}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic border-t border-gray-700 pt-3 mt-2">묘사가 없습니다.</p>
                )}
                {char.notionUrl && (
                  <p className="text-blue-400 text-xs mt-3 flex items-center font-medium">
                    클릭하여 노션 페이지 열기 →
                  </p>
                )}
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
              </div>

              {/* Height Label above head */}
              <span className="text-sm font-bold text-gray-600 mb-2 bg-white/80 px-1 rounded">{char.height}</span>

              {/* Figure */}
              <div className="flex flex-col items-center justify-end" style={{ height: `${heightPx}px` }}>
                {/* Head */}
                <div 
                  className="rounded-full flex-shrink-0 shadow-sm relative z-10"
                  style={{ 
                    width: char.gender === 'male' ? '32px' : '28px', 
                    height: char.gender === 'male' ? '32px' : '28px', 
                    backgroundColor: char.color,
                    opacity: 0.8
                  }}
                />
                
                {/* Body */}
                <div 
                  className="flex-grow shadow-sm relative mt-1"
                  style={{ 
                    backgroundColor: char.color, 
                    width: char.gender === 'male' ? '54px' : '46px',
                    clipPath: char.gender === 'male' 
                      ? 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' // Broad shoulders, narrow waist
                      : 'polygon(25% 0, 75% 0, 100% 100%, 0 100%)', // Narrow shoulders, wide hips/skirt
                    opacity: 0.8
                  }}
                />
              </div>

              {/* Name Label below */}
              <div className="absolute top-full mt-3 text-center w-32 left-1/2 -translate-x-1/2">
                <p className="font-semibold text-gray-800 truncate flex items-center justify-center gap-1">
                  {char.name}
                  {char.notionUrl && <ExternalLink size={12} className="text-blue-500 flex-shrink-0" />}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {char.gender === 'male' ? '남성' : '여성'}
                  {char.series && <span className="block text-[10px] text-gray-400 truncate mt-0.5">{char.series}</span>}
                </p>
              </div>
            </div>
          );

          if (char.notionUrl) {
            return (
              <a 
                key={char.id} 
                href={char.notionUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block relative z-10"
              >
                {CharacterBody}
              </a>
            );
          }

          return <div key={char.id} className="relative z-10">{CharacterBody}</div>;
        })}
      </div>
      </div>
    </div>
  );
}
