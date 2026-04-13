import React, { useState, useEffect } from 'react';
import { Character } from './types';
import CharacterForm from './components/CharacterForm';
import HeightChart from './components/HeightChart';
import CharacterList from './components/CharacterList';
import ConfirmModal from './components/ConfirmModal';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  getDocs,
  writeBatch
} from 'firebase/firestore';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  // 1. Real-time synchronization from Firestore
  useEffect(() => {
    const q = query(collection(db, 'characters'), orderBy('id'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars: Character[] = [];
      snapshot.forEach((doc) => {
        chars.push(doc.data() as Character);
      });
      setCharacters(chars);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Migration: One-time migration from localStorage to Firestore
  useEffect(() => {
    const migrateData = async () => {
      const saved = localStorage.getItem('novel_characters');
      if (saved) {
        try {
          const localChars: Character[] = JSON.parse(saved);
          if (localChars.length > 0) {
            // Check if Firestore is empty before migrating
            const snapshot = await getDocs(collection(db, 'characters'));
            if (snapshot.empty) {
              const batch = writeBatch(db);
              localChars.forEach((char) => {
                const docRef = doc(db, 'characters', char.id);
                batch.set(docRef, char);
              });
              await batch.commit();
              console.log("Data migrated to Firestore");
            }
            // Clear localStorage after migration attempt
            localStorage.removeItem('novel_characters');
          }
        } catch (e) {
          console.error("Migration error:", e);
        }
      }
    };
    
    if (!isLoading) {
      migrateData();
    }
  }, [isLoading]);

  const handleSave = async (character: Character) => {
    try {
      await setDoc(doc(db, 'characters', character.id), character);
      setEditingCharacter(null);
    } catch (error) {
      console.error("Error saving character:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (char) {
      setCharacterToDelete(char);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!characterToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'characters', characterToDelete.id));
      if (editingCharacter?.id === characterToDelete.id) {
        setEditingCharacter(null);
      }
      setIsDeleteModalOpen(false);
      setCharacterToDelete(null);
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
  };

  const handleCancelEdit = () => {
    setEditingCharacter(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">소설 인물 키 비교</h1>
          <p className="text-gray-500 mt-2">캐릭터의 키와 체형을 비교하고 설정을 관리하세요. (실시간 동기화 활성화)</p>
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

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="인물 삭제"
        message={`${characterToDelete?.name} 인물을 정말 삭제하시겠습니까?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setCharacterToDelete(null);
        }}
      />
    </div>
  );
}
