import React from 'react';
import { X } from 'lucide-react';
import { Character } from '../types';
import { getRandomColor } from '../utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (character: Character) => void;
}

const averageHeightData = [
  { age: '7세', male: 121.5, female: 120.1 },
  { age: '8세', male: 128.4, female: 126.4 },
  { age: '9세', male: 133.9, female: 132.4 },
  { age: '10세', male: 138.3, female: 137.8 },
  { age: '11세', male: 144.0, female: 145.2 },
  { age: '12세', male: 151.4, female: 152.7 },
  { age: '13세', male: 158.6, female: 155.6 },
  { age: '14세', male: 164.3, female: 158.2 },
  { age: '15세', male: 169.2, female: 159.2 },
  { age: '16세', male: 170.7, female: 159.6 },
  { age: '17세', male: 172.9, female: 160.5 },
  { age: '18세', male: 173.0, female: 160.1 },
  { age: '19세', male: 172.9, female: 159.8 },
  { age: '20대 전반', male: 174.0, female: 160.5 },
  { age: '20대 후반', male: 173.2, female: 160.4 },
  { age: '30대 전반', male: 172.3, female: 160.4 },
  { age: '30대 후반', male: 172.0, female: 158.6 },
  { age: '40대', male: 169.1, female: 156.6 },
  { age: '50대', male: 166.0, female: 154.7 },
  { age: '60대', male: 164.4, female: 152.3 },
];

export default function AverageHeightModal({ isOpen, onClose, onSelect }: Props) {
  if (!isOpen) return null;

  const handleSelect = (height: number, gender: 'male' | 'female') => {
    const newChar: Character = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      name: gender === 'male' ? 'male' : 'female',
      height,
      gender,
      color: getRandomColor(),
      description: `평균 키 (${gender === 'male' ? '남성' : '여성'})`,
    };
    onSelect(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">대한민국 연령별 평균 키 (단위: cm)</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto min-h-0 flex-grow">
          <p className="text-sm text-gray-500 mb-4">
            키 수치를 클릭하면 해당 남/녀 캐릭터가 자동으로 추가됩니다.
          </p>
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="py-2 px-2 text-gray-600 font-semibold w-1/3">연령</th>
                <th className="py-2 px-2 text-blue-600 font-semibold w-1/3">남자</th>
                <th className="py-2 px-2 text-pink-600 font-semibold w-1/3">여자</th>
              </tr>
            </thead>
            <tbody>
              {averageHeightData.map((data, idx) => (
                <tr key={idx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                  <td className="py-2 px-2 font-medium text-gray-700">{data.age}</td>
                  <td className="py-2 px-2">
                    <button 
                      onClick={() => handleSelect(data.male, 'male')}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full font-medium transition-colors"
                      title="남자 캐릭터 추가"
                    >
                      {data.male}
                    </button>
                  </td>
                  <td className="py-2 px-2">
                    <button 
                      onClick={() => handleSelect(data.female, 'female')}
                      className="text-pink-600 hover:text-pink-800 hover:bg-pink-50 px-2 py-1 rounded w-full font-medium transition-colors"
                      title="여자 캐릭터 추가"
                    >
                      {data.female}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4 text-right">자료: 지식경제부·기술표준원 (2010년)</p>
        </div>
      </div>
    </div>
  );
}
