import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Ruler, User, Book } from 'lucide-react';
import { Character } from '../types';

interface Props {
  character: Character | null;
  onClose: () => void;
}

export default function CharacterDetailDrawer({ character, onClose }: Props) {
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
              {/* Visual Header */}
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-2xl shadow-inner"
                  style={{ backgroundColor: character.color }}
                />
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">{character.name}</h4>
                  <p className="text-gray-500">{character.series || '시리즈 정보 없음'}</p>
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
                    <span className="text-xs font-medium">체형</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {character.gender === 'male' ? '남성형' : '여성형'}
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

              {/* Series Info */}
              {character.series && (
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-4 rounded-xl">
                  <Book size={18} />
                  <span className="text-sm font-medium">{character.series}</span>
                </div>
              )}
            </div>

            {/* Footer / Action */}
            <div className="p-6 border-t bg-gray-50">
              {character.notionUrl ? (
                <a 
                  href={character.notionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  <ExternalLink size={20} />
                  노션 페이지 열기
                </a>
              ) : (
                <button 
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-400 py-4 rounded-2xl font-bold cursor-not-allowed"
                >
                  노션 링크 없음
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
