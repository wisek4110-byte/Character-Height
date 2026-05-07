import React, { useState } from 'react';
import { Character } from '../types';
import { Edit2, Trash2, ExternalLink, Search } from 'lucide-react';

interface Props {
  characters: Character[];
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
  onFilterChange?: (filteredIds: string[]) => void;
}

export default function CharacterList({ characters, onEdit, onDelete, onFilterChange }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = characters.filter(char => {
    if (!searchQuery.trim()) return true;
    
    // Split query by commas or spaces and filter
    const keywords = searchQuery.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const searchableText = `${char.name} ${char.series || ''} ${char.description || ''}`.toLowerCase();
    
    return keywords.every(kw => searchableText.includes(kw));
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Update chart highlight or filtering through a parent callback if provided
    if (onFilterChange) {
      if (!val.trim()) {
        onFilterChange([]);
      } else {
        const matchingIds = characters
          .filter(char => {
            const keywords = val.toLowerCase().split(/[\s,]+/).filter(Boolean);
            const searchableText = `${char.name} ${char.series || ''} ${char.description || ''}`.toLowerCase();
            return keywords.every(kw => searchableText.includes(kw));
          })
          .map(c => c.id);
        onFilterChange(matchingIds);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3 flex-shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="이름, 소설 등 검색 (쉼표, 띄어쓰기로 다중 검색)"
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-gray-800"
        />
      </div>

      <div className="flex-grow min-h-0">
        {characters.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">등록된 인물이 없습니다.</p>
        ) : filteredCharacters.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">검색 결과가 없습니다.</p>
        ) : (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCharacters.map(char => (
              <li key={char.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: char.color }}
                  />
                  <div className="truncate">
                    <p className="font-medium text-gray-800 truncate flex items-center gap-1">
                      {char.name}
                      {char.notionUrl && <ExternalLink size={12} className="text-blue-500 flex-shrink-0" title="노션 링크 있음" />}
                    </p>
                    <p className="text-xs text-gray-500">
                      {char.height}cm • {char.gender === 'male' ? '남성' : '여성'}
                      {char.series && ` • ${char.series}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {char.notionUrl && (
                    <a 
                      href={char.notionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="노션으로 이동"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button 
                    onClick={() => onEdit(char)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="수정"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(char.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
