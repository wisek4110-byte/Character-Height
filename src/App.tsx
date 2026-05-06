import React, { useState, useEffect } from 'react';
import { Character } from './types';
import CharacterForm from './components/CharacterForm';
import HeightChart from './components/HeightChart';
import CharacterList from './components/CharacterList';
import ConfirmModal from './components/ConfirmModal';
import ObjectSelector from './components/ObjectSelector';
import { db } from './firebase';
import { LayoutDashboard, UserPlus, Users, Box } from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  getDocs,
  writeBatch,
  where
} from 'firebase/firestore';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'add' | 'list' | 'objects'>('chart');
  const [sidebarTab, setSidebarTab] = useState<'add' | 'list' | 'objects'>('add');

  // Get project ID from URL (e.g., ?id=story1)
  const [projectId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'default';
  });

  // Load selected objects from localStorage per project
  useEffect(() => {
    const saved = localStorage.getItem(`selected_objects_${projectId}`);
    if (saved) {
      try {
        setSelectedObjects(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading selected objects", e);
      }
    }
  }, [projectId]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(`selected_objects_${projectId}`, JSON.stringify(selectedObjects));
    }
  }, [selectedObjects, projectId, isLoading]);

  // 1. Real-time synchronization from Firestore
// ... (lines 34-59 remain mostly same, just checking dependency)
  useEffect(() => {
    const q = query(
      collection(db, 'characters'), 
      where('projectId', '==', projectId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars: Character[] = [];
      snapshot.forEach((doc) => {
        chars.push(doc.data() as Character);
      });
      chars.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id));
      setCharacters(chars);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [projectId]);

  // ... (Migration effect 61-96 continues)
  useEffect(() => {
    const migrateData = async () => {
      const saved = localStorage.getItem('novel_characters');
      if (saved) {
        try {
          const localChars: Character[] = JSON.parse(saved);
          if (localChars.length > 0) {
            const snapshot = await getDocs(query(collection(db, 'characters'), where('projectId', '==', projectId)));
            if (snapshot.empty) {
              const batch = writeBatch(db);
              localChars.forEach((char, index) => {
                const docRef = doc(db, 'characters', char.id);
                batch.set(docRef, { 
                  ...char, 
                  projectId, 
                  order: index 
                });
              });
              await batch.commit();
            }
            localStorage.removeItem('novel_characters');
          }
        } catch (e) {}
      }
    };
    if (!isLoading) migrateData();
  }, [isLoading, projectId]);

  const handleSave = async (character: Character) => {
    try {
      let order = character.order;
      if (order === undefined) {
        if (characters.length > 0) {
          order = Math.min(...characters.map(c => c.order ?? 0)) - 1;
        } else {
          order = 0;
        }
      }
      
      const charData = {
        ...character,
        projectId,
        order
      };
      await setDoc(doc(db, 'characters', character.id), charData);
      setEditingCharacter(null);
      // Switch back to list or chart after save on mobile
      if (window.innerWidth < 1024) {
        setActiveTab('list');
      }
    } catch (error) {
      console.error("Error saving character:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleToggleObject = (obj: Character) => {
    setSelectedObjects(prev => {
      if (prev.find(o => o.id === obj.id)) {
        return prev.filter(o => o.id !== obj.id);
      }
      return [...prev, obj];
    });
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
    } catch (error) {}
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

  // Combined list for HeightChart (Objects always at the back)
  const allEntitiesForChart = [...selectedObjects, ...characters];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm relative overflow-hidden">
        {/* Banner Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/app-banner.png" 
            alt="Header Banner"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>

        <div className="px-6 py-4 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">소설 인물 키 비교</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Project</span>
              <span className="text-sm font-semibold text-gray-700">{projectId}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 lg:p-6 flex flex-col gap-6">
        {/* Main Content Area: Responsive Layout */}
        <div className="flex flex-col lg:flex-row gap-6 h-full flex-grow overflow-hidden min-h-[calc(100vh-140px)]">
          
          {/* Chart Area - Stays on top on mobile, grows on desktop */}
          <div className="flex-grow order-1 lg:order-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[450px] lg:h-full overflow-hidden min-w-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-20">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">키 비교 차트</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-400">자유로운 드래그 비교</span>
              </div>
            </div>
            <div className="flex-grow min-h-0 bg-slate-50/5">
              <HeightChart 
                characters={allEntitiesForChart} 
                onUpdate={handleSave}
              />
            </div>
          </div>

          {/* Control Sidebar/Bottombar - Below chart on mobile, Left on desktop */}
          <div className="w-full lg:w-[320px] order-2 lg:order-1 flex-shrink-0 flex flex-col space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full lg:max-h-[calc(100vh-140px)]">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {[
                  { id: 'add', label: '추가', icon: UserPlus },
                  { id: 'list', label: '목록', icon: Users },
                  { id: 'objects', label: '사물', icon: Box },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSidebarTab(tab.id as 'add' | 'list' | 'objects')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-bold transition-all border-b-2 ${
                      sidebarTab === tab.id 
                        ? 'border-blue-600 text-blue-600 bg-white' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar flex-grow min-h-[400px]">
                {sidebarTab === 'add' && (
                  <div>
                    <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-gray-800">
                      <UserPlus size={18} className="text-blue-600" />
                      {editingCharacter ? '인물 수정' : '새 인물 추가'}
                    </h2>
                    <CharacterForm 
                      onSave={handleSave} 
                      editingCharacter={editingCharacter} 
                      onCancel={() => setEditingCharacter(null)}
                    />
                  </div>
                )}
                
                {sidebarTab === 'list' && (
                  <div>
                    <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-gray-800">
                      <Users size={18} className="text-blue-600" />
                      인물 목록
                    </h2>
                    <CharacterList 
                      characters={characters} 
                      onEdit={(c) => {
                        setEditingCharacter(c);
                        setSidebarTab('add');
                      }} 
                      onDelete={handleDelete} 
                    />
                  </div>
                )}

                {sidebarTab === 'objects' && (
                  <div>
                    <h2 className="text-base font-bold mb-5 flex items-center gap-2 text-gray-800">
                      <Box size={18} className="text-blue-600" />
                      비교용 사물
                    </h2>
                    <ObjectSelector 
                      selectedObjectIds={selectedObjects.map(o => o.id)} 
                      onToggleObject={handleToggleObject} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

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
