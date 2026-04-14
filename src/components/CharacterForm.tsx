import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { getRandomColor } from '../utils';

interface Props {
  onSave: (character: Character) => void;
  editingCharacter: Character | null;
  onCancel: () => void;
}

export default function CharacterForm({ onSave, editingCharacter, onCancel }: Props) {
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    height: 170,
    gender: 'male',
    description: '',
    notionUrl: '',
    color: getRandomColor(),
    series: '',
  });

  useEffect(() => {
    if (editingCharacter) {
      setFormData(editingCharacter);
    } else {
      setFormData({
        name: '',
        height: 170,
        gender: 'male',
        description: '',
        notionUrl: '',
        color: getRandomColor(),
        series: '',
      });
    }
  }, [editingCharacter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'height') {
      // Allow empty string for better input experience (backspacing)
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.height === '' || formData.height === undefined) return;

    onSave({
      id: editingCharacter ? editingCharacter.id : (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
      name: formData.name,
      height: Number(formData.height),
      gender: formData.gender as 'male' | 'female',
      description: formData.description || '',
      notionUrl: formData.notionUrl || '',
      color: formData.color || getRandomColor(),
      series: formData.series || '',
    });

    if (!editingCharacter) {
      setFormData({
        name: '',
        height: 170,
        gender: 'male',
        description: '',
        notionUrl: '',
        color: getRandomColor(),
        series: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 홍길동"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">소설/시리즈 (선택)</label>
          <input 
            type="text" 
            name="series" 
            value={formData.series || ''} 
            onChange={handleChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 해리포터"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">키 (cm)</label>
          <input 
            type="number" 
            name="height" 
            value={formData.height} 
            onChange={handleChange} 
            required
            min="50"
            max="300"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">체형 (성별)</label>
          <select 
            name="gender" 
            value={formData.gender} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="male">남성형</option>
            <option value="female">여성형</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">키 묘사 / 설명</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 훤칠하고 다부진 체격. 문지방에 머리가 닿을 듯하다."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">노션 URL (선택)</label>
        <input 
          type="url" 
          name="notionUrl" 
          value={formData.notionUrl} 
          onChange={handleChange} 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://notion.so/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">테마 색상</label>
        <div className="flex items-center space-x-2">
          <input 
            type="color" 
            name="color" 
            value={formData.color} 
            onChange={handleChange} 
            className="h-10 w-10 rounded cursor-pointer border-0 p-0"
          />
          <span className="text-sm text-gray-500 uppercase">{formData.color}</span>
          <button 
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, color: getRandomColor() }))}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
          >
            랜덤
          </button>
        </div>
      </div>

      <div className="flex space-x-2 pt-2">
        <button 
          type="submit" 
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          {editingCharacter ? '수정 완료' : '추가하기'}
        </button>
        {editingCharacter && (
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
