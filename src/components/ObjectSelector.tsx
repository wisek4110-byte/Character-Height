import React from 'react';
import { STANDARD_OBJECTS } from '../constants/objects';
import { Character } from '../types';
import { Check, DoorClosed, Bed, Car, Presentation, Box } from 'lucide-react';

interface Props {
  selectedObjectIds: string[];
  onToggleObject: (obj: Character) => void;
}

const ObjectIcon = ({ id, size }: { id: string, size: number }) => {
  switch (id) {
    case 'obj-door': return <DoorClosed size={size} />;
    case 'obj-bed': return <Bed size={size} />;
    case 'obj-car': return <Car size={size} />;
    case 'obj-chalkboard': return <Presentation size={size} />;
    default: return <Box size={size} />;
  }
};

export default function ObjectSelector({ selectedObjectIds, onToggleObject }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">표준 크기의 사물을 차트에 추가하여 인물의 키를 더 직관적으로 체감할 수 있습니다.</p>
      <div className="grid grid-cols-1 gap-3">
        {STANDARD_OBJECTS.map((obj) => (
          <button
            key={obj.id}
            onClick={() => onToggleObject(obj)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              selectedObjectIds.includes(obj.id)
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-xs bg-gray-800"
              >
                <ObjectIcon id={obj.id} size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">{obj.name}</p>
                <p className="text-xs text-gray-500">{obj.description}</p>
              </div>
            </div>
            {selectedObjectIds.includes(obj.id) && (
              <div className="bg-blue-600 text-white p-1 rounded-full">
                <Check size={14} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
