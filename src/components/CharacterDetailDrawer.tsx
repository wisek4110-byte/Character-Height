import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Ruler, User, Book, Pencil } from 'lucide-react';
import { Character } from '../types';
import CharacterForm from './CharacterForm';

interface Props {
  character: Character | null;
  onClose: () => void;
  onUpdate?: (character: Character) => Promise<void> | void;
}

export default function CharacterDetailDrawer({ character, onClose, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [character]);
  return (
    <AnimatePresence>
      {character && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[120] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">인물 상세 정보</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {isEditing ? (
                <div>
                  <h4 className="text-xl font-bold mb-4">인물 수정</h4>
                  <CharacterForm
                    editingCharacter={character}
                    onSave={(updated) => {
                      if (onUpdate) onUpdate(updated);
                      setIsEditing(false);
                    }}
                    onCancel={() => setIsEditing(false)}
                  />
                </div>
              ) : (
                <>
                  {/* Visual Header */}
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-2xl shadow-inner"
                  style={{ backgroundColor: character.color }}
                />
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">{character.name}</h4>
                  {character.series && (
                    <div className="flex items-center space-x-1.5 text-gray-500 mt-1">
                      <Book size={16} />
                      <span className="text-sm font-medium">{character.series}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Ruler size={16} className="mr-1" />
                    <span className="text-xs font-medium">키</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{character.height}cm</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center text-gray-500 mb-1">
                    <User size={16} className="mr-1" />
                    <span className="text-xs font-medium">성별</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {character.gender === 'male' ? '남성' : '여성'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider">키 묘사 및 설정</h5>
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 min-h-[120px]">
                  {character.description ? (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {character.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">등록된 묘사가 없습니다.</p>
                  )}
                </div>
              </div>

                </>
              )}
            </div>

            {/* Footer / Action */}
            {!isEditing && (
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                {character.notionUrl ? (
                  <a 
                    href={character.notionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  <ExternalLink size={20} />
                  노션 페이지
                </a>
              ) : (
                <button 
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-400 py-4 rounded-2xl font-bold cursor-not-allowed"
                >
                  노션 없음
                </button>
                )}
                {onUpdate && !character.isObject && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <Pencil size={20} />
                    <span className="text-[10px] uppercase">수정</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
