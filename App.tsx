import React, { useState, useEffect } from 'react';
import MarketTable from './components/MarketTable';
import PersonnelTable from './components/PersonnelTable';
import ResearchTools from './components/ResearchTools';
import { refreshMarketData } from './services/geminiService';
import { MarketData, CompetitorRow, PersonnelRow, Tab, GroundingChunk } from './types';
import { INITIAL_COMPETITORS, INITIAL_PERSONNEL } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MATRIX);
  
  // Data State
  const [competitors, setCompetitors] = useState<CompetitorRow[]>(INITIAL_COMPETITORS);
  const [personnel, setPersonnel] = useState<PersonnelRow[]>(INITIAL_PERSONNEL);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('Never');

  const handleUpdateCompetitor = (id: string, field: keyof CompetitorRow, value: string) => {
    setCompetitors(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleLockCompetitor = (id: string, field: keyof CompetitorRow) => {
    setCompetitors(prev => prev.map(row => {
      if (row.id === id) {
        // Mark as locked (HLRL)
        const newLocks = { ...row.isLocked, [field]: true };
        return { ...row, isLocked: newLocks };
      }
      return row;
    }));
  };

  const handleUpdatePersonnel = (id: string, field: keyof PersonnelRow, value: string) => {
    setPersonnel(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleLockPersonnel = (id: string, field: keyof PersonnelRow) => {
    setPersonnel(prev => prev.map(row => {
      if (row.id === id) {
        const newLocks = { ...row.isLocked, [field]: true };
        return { ...row, isLocked: newLocks };
      }
      return row;
    }));
  };

  const mergeData = (newData: MarketData) => {
    // Competitors Merge
    setCompetitors(prev => {
      // 1. Map existing rows, keeping values if locked
      const mergedExisting = prev.map(existingRow => {
        const newRow = newData.competitors.find(r => r.name === existingRow.name || r.id === existingRow.id);
        if (!newRow) return existingRow; // Keep if not in new data (or handle deletion?) - for now keep.

        // Merge logic: use existing if locked, else new
        const mergedRow = { ...existingRow };
        (Object.keys(newRow) as Array<keyof CompetitorRow>).forEach(key => {
          if (key === 'isLocked' || key === 'id') return;
          if (!existingRow.isLocked[key]) {
             // @ts-ignore
             mergedRow[key] = newRow[key];
          }
        });
        return mergedRow;
      });

      // 2. Add completely new rows from newData that weren't in prev
      const newRows = newData.competitors
        .filter(n => !prev.find(p => p.name === n.name || p.id === n.id))
        .map(n => ({ ...n, id: n.id || `gen_${Math.random().toString(36).substr(2,9)}`, isLocked: {} }));

      return [...mergedExisting, ...newRows];
    });

    // Personnel Merge (Similar logic)
    setPersonnel(prev => {
      const mergedExisting = prev.map(existingRow => {
        const newRow = newData.personnel.find(r => r.name === existingRow.name || r.id === existingRow.id);
        if (!newRow) return existingRow;

        const mergedRow = { ...existingRow };
        (Object.keys(newRow) as Array<keyof PersonnelRow>).forEach(key => {
            if (key === 'isLocked' || key === 'id') return;
            if (!existingRow.isLocked[key]) {
               // @ts-ignore
               mergedRow[key] = newRow[key];
            }
        });
        return mergedRow;
      });

      const newRows = newData.personnel
        .filter(n => !prev.find(p => p.name === n.name || p.id === n.id))
        .map(n => ({ ...n, id: n.id || `gen_p_${Math.random().toString(36).substr(2,9)}`, isLocked: {} }));

      return [...mergedExisting, ...newRows];
    });
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const currentData: MarketData = { competitors, personnel };
      const { data, groundingChunks } = await refreshMarketData(currentData);
      
      mergeData(data);
      if (groundingChunks) setGroundingSources(groundingChunks);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      alert("Refresh failed: " + (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshMemory = () => {
    if (confirm("Are you sure? This will wipe all locked data and restart.")) {
      setCompetitors(INITIAL_COMPETITORS);
      setPersonnel(INITIAL_PERSONNEL);
      setGroundingSources([]);
      setLastUpdated('Reset');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">DentalIntel <span className="text-blue-400">DFW</span></h1>
            <p className="text-xs text-slate-400">Internal Hardened Intelligence • AD&I/DDS</p>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
               <p className="text-xs text-slate-400">Last Update</p>
               <p className="text-sm font-mono">{lastUpdated}</p>
             </div>
             <button 
                onClick={handleRefresh}
                disabled={isLoading}
                className={`px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2 ${isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
             >
                {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Thinking...
                    </>
                ) : 'Refresh Market'}
             </button>
             <button 
                onClick={handleRefreshMemory}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white border border-slate-700 rounded hover:border-red-500 hover:bg-red-900/20"
             >
                Reset
             </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 mt-2">
            <nav className="flex space-x-6 text-sm font-medium">
                <button 
                    onClick={() => setActiveTab(Tab.MATRIX)}
                    className={`pb-3 border-b-2 ${activeTab === Tab.MATRIX ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    Competitive Matrix
                </button>
                <button 
                    onClick={() => setActiveTab(Tab.PERSONNEL)}
                    className={`pb-3 border-b-2 ${activeTab === Tab.PERSONNEL ? 'border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    Personnel & Capacity
                </button>
                <button 
                    onClick={() => setActiveTab(Tab.TOOLS)}
                    className={`pb-3 border-b-2 ${activeTab === Tab.TOOLS ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                    Research Tools
                </button>
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Sources Banner if Grounding Exists */}
        {groundingSources.length > 0 && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h3 className="text-xs font-bold text-indigo-800 uppercase mb-2">Verified Sources (Search Grounding)</h3>
                <div className="flex flex-wrap gap-2">
                    {groundingSources.map((source, idx) => (
                        source.web ? (
                            <a key={idx} href={source.web.uri} target="_blank" rel="noreferrer" className="text-xs bg-white text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:border-indigo-300 truncate max-w-xs">
                                {source.web.title}
                            </a>
                        ) : null
                    ))}
                </div>
            </div>
        )}

        {activeTab === Tab.MATRIX && (
          <MarketTable 
            data={competitors} 
            onUpdate={handleUpdateCompetitor}
            onLock={handleLockCompetitor}
          />
        )}

        {activeTab === Tab.PERSONNEL && (
          <PersonnelTable 
            data={personnel}
            onUpdate={handleUpdatePersonnel}
            onLock={handleLockPersonnel}
          />
        )}

        {activeTab === Tab.TOOLS && (
            <ResearchTools />
        )}

      </main>
      
      {/* Legend / Status Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 text-xs text-gray-500 flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                HLRL Locked
            </span>
            <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-100 border border-blue-200"></span>
                Internal Entity
            </span>
        </div>
        <div>
            Gemini 3 Pro Thinking Budget: 32k
        </div>
      </footer>

    </div>
  );
};

export default App;