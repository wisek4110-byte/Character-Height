import React, { useState, useEffect } from 'react';
import { Character } from './types';
import CharacterForm from './components/CharacterForm';
import HeightChart from './components/HeightChart';
import CharacterList from './components/CharacterList';
import ConfirmModal from './components/ConfirmModal';
import ObjectSelector from './components/ObjectSelector';
import { auth, db } from './firebase';
import { LayoutDashboard, UserPlus, Users, Box, Share2, Check, LogIn, LogOut, Save } from 'lucide-react';
import { 
  doc, 
  setDoc, 
  getDoc
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

import { handleFirestoreError, OperationType } from './firestoreError';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<Character[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'add' | 'list' | 'objects'>('add');
  
  const [isCopied, setIsCopied] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<string[] | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('id');
  
  // Track Auth State Let
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const [projectAuthorId, setProjectAuthorId] = useState<string | null>(null);
  const isCloudProject = !!projectAuthorId;
  const isReadOnly = isCloudProject && (!user || user.uid !== projectAuthorId);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      let loadedFromCloud = false;
      if (shareId) {
        try {
          const docRef = doc(db, 'projects', shareId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setCharacters(data.characters || []);
            setSelectedObjects(data.selectedObjects || []);
            setProjectAuthorId(data.authorId || shareId);
            loadedFromCloud = true;
          }
        } catch (e) {
          console.error("Failed to load from cloud", e);
        }
      }
      
      if (!loadedFromCloud) {
        setProjectAuthorId(null);
        setCharacters([]);
        setSelectedObjects([]);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [shareId]);

  const handleCopyLink = () => {
    if (!user) {
      alert("공유 링크를 생성하려면 먼저 로그인해야 합니다.");
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('id', user.uid);
    navigator.clipboard.writeText(url.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/requests-from-referer-are-blocked' || error.message?.includes('auth/requests-from-referer')) {
        alert('구글 클라우드 콘솔(Google Cloud Console)의 "Browser key (auto created by Firebase)" API 키 제한 설정에 다음 URL들을 모두 추가해주세요:\n\n1. *.run.app\n2. *.firebaseapp.com (또는 gen-lang-client-0175785664.firebaseapp.com)\n\nFirebase Auth 팝업이 firebaseapp.com 도메인을 통해 실행되기 때문에 해당 도메인도 허용해야 합니다.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        alert('로그인 팝업이 닫혔습니다. 브라우저 설정에서 팝업 차단이 되어있지 않은지 확인하거나, 로그인 창이 뜨면 닫지 말고 계속 진행해주세요.');
      } else {
        alert(`로그인 중 오류가 발생했습니다 (${error.code || '알 수 없는 오류'}): ${error.message}`);
      }
    }
  };
  const logout = () => signOut(auth);

  const saveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'projects', user.uid), {
        authorId: user.uid,
        characters,
        selectedObjects,
        updatedAt: new Date().toISOString()
      });
      
      const url = new URL(window.location.href);
      if (url.searchParams.get('id') !== user.uid) {
        url.searchParams.set('id', user.uid);
        window.history.replaceState({}, '', url.toString());
      }
      
      alert('데이터가 성공적으로 저장되었습니다!');
    } catch (e) {
      alert('저장에 실패했습니다.');
      handleFirestoreError(e, OperationType.WRITE, `projects/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  const loadFromCloud = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'projects', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setCharacters(data.characters || []);
        setSelectedObjects(data.selectedObjects || []);
        alert('클라우드에서 데이터를 불러왔습니다.');
      } else {
        alert('저장된 데이터가 없습니다.');
      }
    } catch (e) {
      alert('불러오기에 실패했습니다.');
      handleFirestoreError(e, OperationType.GET, `projects/${user.uid}`);
    }
  };

  const handleSave = (character: Character) => {
    if (isReadOnly) return;
    let order = character.order;
    if (order === undefined) {
      order = characters.length > 0 ? Math.min(...characters.map(c => c.order ?? 0)) - 1 : 0;
    }
    
    setCharacters(prev => {
      const existing = prev.findIndex(c => c.id === character.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...character, order: prev[existing].order }; // Keep existing order when editing
        return next;
      }
      return [...prev, { ...character, order }];
    });
    setEditingCharacter(null);
    if (window.innerWidth < 1024) setActiveTab('list'); // activeTab fallback
  };

  const handleReorder = (newOrder: Character[]) => {
    if (isReadOnly) return;
    const updated = newOrder.map((char, index) => ({ ...char, order: index }));
    // We update only the characters that are active (non-objects)
    setCharacters(prev => {
      const merged = [...prev];
      updated.forEach(u => {
        const idx = merged.findIndex(c => c.id === u.id);
        if (idx >= 0) merged[idx] = u;
      });
      return merged;
    });
  };

  const handleToggleObject = (obj: Character) => {
    if (isReadOnly) return;
    setSelectedObjects(prev => {
      if (prev.find(o => o.id === obj.id)) return prev.filter(o => o.id !== obj.id);
      return [...prev, obj];
    });
  };

  const handleDelete = (id: string) => {
    if (isReadOnly) return;
    const char = characters.find(c => c.id === id);
    if (char) {
      setCharacterToDelete(char);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!characterToDelete) return;
    setCharacters(prev => prev.filter(c => c.id !== characterToDelete.id));
    if (editingCharacter?.id === characterToDelete.id) setEditingCharacter(null);
    setIsDeleteModalOpen(false);
    setCharacterToDelete(null);
  };

  // set activeTab fallback
  const [activeTab, setActiveTab] = useState<'chart' | 'add' | 'list' | 'objects'>('chart');

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

  const allEntitiesForChart = [...selectedObjects, ...characters];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm relative overflow-hidden">
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
          <div className="flex items-center gap-3">
            {!isReadOnly && (
              <>
                {user ? (
                  <>
                    <button 
                      onClick={loadFromCloud}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200"
                    >
                      <LogOut size={16} className="rotate-180" />
                      <span className="hidden sm:inline">불러오기</span>
                    </button>
                    <button 
                      onClick={saveToCloud}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-700"
                    >
                      <Save size={16} />
                      <span className="hidden sm:inline">{isSaving ? '저장 중...' : '저장하기'}</span>
                    </button>
                    <button 
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                        isCopied 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                      <span className="hidden sm:inline">{isCopied ? '링크 복사됨' : '공유'}</span>
                    </button>
                    <button 
                       onClick={logout}
                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                    >
                       <LogOut size={16} />
                       <span className="hidden sm:inline">로그아웃</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={login}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">로그인하여 저장</span>
                  </button>
                )}
              </>
            )}
            {isReadOnly && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                <span className="hidden sm:inline">공유된 차트 (읽기 전용)</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 lg:p-6 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full flex-grow overflow-hidden min-h-[calc(100vh-140px)]">
          
          <div className="flex-grow order-1 lg:order-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[450px] lg:h-full overflow-hidden min-w-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-20">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">키 비교 차트</h2>
              </div>
            </div>
            <div className="flex-grow min-h-0 bg-slate-50/5">
              <HeightChart 
                characters={allEntitiesForChart} 
                onUpdate={isReadOnly ? undefined : handleSave}
                onReorder={isReadOnly ? undefined : handleReorder}
                highlightedIds={highlightedIds}
              />
            </div>
          </div>

          {!isReadOnly && (
            <div className="w-full lg:w-[320px] order-2 lg:order-1 flex-shrink-0 flex flex-col space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full lg:max-h-[calc(100vh-140px)]">
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
                        onFilterChange={setHighlightedIds}
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
          )}
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

