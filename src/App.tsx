import React, { useState, useEffect } from 'react';
import { Character } from './types';
import CharacterForm from './components/CharacterForm';
import HeightChart from './components/HeightChart';
import CharacterList from './components/CharacterList';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('novel_characters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  useEffect(() => {
    localStorage.setItem('novel_characters', JSON.stringify(characters));
  }, [characters]);

  const handleSave = (character: Character) => {
    if (editingCharacter) {
      setCharacters(characters.map(c => c.id === character.id ? character : c));
      setEditingCharacter(null);
    } else {
      setCharacters([...characters, character]);
    }
  };

  const handleDelete = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
    if (editingCharacter?.id === id) {
      setEditingCharacter(null);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
  };

  const handleCancelEdit = () => {
    setEditingCharacter(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">소설 인물 키 비교</h1>
          <p className="text-gray-500 mt-2">캐릭터의 키와 체형을 비교하고 설정을 관리하세요.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">
                {editingCharacter ? '인물 수정' : '새 인물 추가'}
              </h2>
              <CharacterForm 
                onSave={handleSave} 
                editingCharacter={editingCharacter} 
                onCancel={handleCancelEdit}
              />
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">인물 목록</h2>
              <CharacterList 
                characters={characters} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold mb-4">키 비교 차트</h2>
            <div className="flex-grow overflow-x-auto">
              <HeightChart characters={characters} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
