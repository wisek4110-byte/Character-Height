import React from 'react';
import { Character } from '../types';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';

interface Props {
  characters: Character[];
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
}

export default function CharacterList({ characters, onEdit, onDelete }: Props) {
  if (characters.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-4">등록된 인물이 없습니다.</p>;
  }

  return (
    <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {characters.map(char => (
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
                {char.height}cm • {char.gender === 'male' ? '남성형' : '여성형'}
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
              onClick={() => {
                if (window.confirm(`${char.name} 인물을 삭제하시겠습니까?`)) {
                  onDelete(char.id);
                }
              }}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
