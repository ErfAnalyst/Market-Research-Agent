import React, { useState } from 'react';
import { AspectRatio } from '../types';
import { generateImage, editImage, analyzeImage, analyzeVideo, verifyLocation, quickAnswer } from '../services/geminiService';

const ResearchTools: React.FC = () => {
  // State for Image Gen
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.RATIO_1_1);
  const [genImage, setGenImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for Image Analysis/Edit
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  // State for Maps
  const [mapsQuery, setMapsQuery] = useState('');
  const [mapsResult, setMapsResult] = useState<{ text: string, chunks: any[] } | null>(null);
  const [isMapping, setIsMapping] = useState(false);

  // State for Quick Answer
  const [qaQuery, setQaQuery] = useState('');
  const [qaResult, setQaResult] = useState('');
  const [isQa, setIsQa] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult('');
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt) return;
    setIsGenerating(true);
    try {
      const b64 = await generateImage(genPrompt, aspectRatio);
      setGenImage(`data:image/png;base64,${b64}`);
    } catch (e) {
      alert('Generation failed: ' + (e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessingImg(true);
    try {
      if (selectedFile.type.startsWith('video/')) {
        const text = await analyzeVideo(selectedFile, editPrompt || "Describe the key competitive details in this video.");
        setAnalysisResult(text);
      } else {
        // Image
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
            const b64 = (reader.result as string).split(',')[1];
            const text = await analyzeImage(b64, selectedFile.type, editPrompt || "Analyze this image for dental pricing or clinic details.");
            setAnalysisResult(text);
        }
      }
    } catch (e) {
      setAnalysisResult('Error: ' + (e as Error).message);
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedFile || !editPrompt) return;
    setIsProcessingImg(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
          const b64 = (reader.result as string).split(',')[1];
          const newB64 = await editImage(b64, selectedFile.type, editPrompt);
          setGenImage(`data:image/png;base64,${newB64}`); // Show result in the same result box
      }
    } catch (e) {
      alert('Edit failed: ' + (e as Error).message);
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleMapSearch = async () => {
      if (!mapsQuery) return;
      setIsMapping(true);
      try {
        // Get user location if possible
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const res = await verifyLocation(mapsQuery, pos.coords.latitude, pos.coords.longitude);
            setMapsResult(res);
            setIsMapping(false);
        }, async () => {
            // Fallback without location
            const res = await verifyLocation(mapsQuery);
            setMapsResult(res);
            setIsMapping(false);
        });
      } catch (e) {
          setIsMapping(false);
          alert("Maps error: " + (e as Error).message);
      }
  };

  const handleQuickAnswer = async () => {
      if(!qaQuery) return;
      setIsQa(true);
      try {
          const res = await quickAnswer(qaQuery);
          setQaResult(res);
      } catch(e) {
          setQaResult("Error: " + (e as Error).message);
      } finally {
          setIsQa(false);
      }
  }

  return (
    <div className="space-y-8 p-4 bg-white rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Analyst Toolkit (Gemini Powered)</h2>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Visual Tools */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg text-indigo-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Visual Intelligence
            </h3>
            
            <div className="p-4 bg-gray-50 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Generate Marketing Asset</label>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={genPrompt}
                        onChange={(e) => setGenPrompt(e.target.value)}
                        placeholder="e.g. Modern dental clinic lobby in Dallas..." 
                        className="flex-1 border rounded px-2 py-1"
                    />
                    <select 
                        value={aspectRatio} 
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isGenerating ? '...' : 'Gen'}
                    </button>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Analyze/Edit (Image or Video)</label>
                <input type="file" onChange={handleFileChange} accept="image/*,video/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-2" />
                
                {previewUrl && (
                    <div className="mb-2">
                        {selectedFile?.type.startsWith('video/') ? 
                            <video src={previewUrl} controls className="h-32 rounded border" /> : 
                            <img src={previewUrl} alt="Preview" className="h-32 object-cover rounded border" />
                        }
                    </div>
                )}

                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Prompt for analysis or edit..." 
                        className="flex-1 border rounded px-2 py-1"
                    />
                    <button onClick={handleAnalyze} disabled={isProcessingImg} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50">
                        Analyze
                    </button>
                    <button onClick={handleEdit} disabled={isProcessingImg || !selectedFile?.type.startsWith('image/')} className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50">
                        Edit
                    </button>
                </div>
                {analysisResult && <div className="mt-2 p-2 bg-white border rounded text-xs text-gray-800 whitespace-pre-wrap">{analysisResult}</div>}
            </div>

            {genImage && (
                <div className="mt-4">
                    <p className="text-sm font-medium mb-1">Result:</p>
                    <img src={genImage} alt="Generated" className="w-full rounded shadow-lg" />
                </div>
            )}
        </div>

        {/* Data Tools */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg text-emerald-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Grounding & Speed
            </h3>

            <div className="p-4 bg-gray-50 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Verification (Maps)</label>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={mapsQuery}
                        onChange={(e) => setMapsQuery(e.target.value)}
                        placeholder="e.g. ClearChoice Clinics in Dallas" 
                        className="flex-1 border rounded px-2 py-1"
                    />
                    <button 
                        onClick={handleMapSearch} 
                        disabled={isMapping}
                        className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {isMapping ? 'Searching...' : 'Verify'}
                    </button>
                </div>
                {mapsResult && (
                    <div className="mt-2 p-2 bg-white border rounded text-xs text-gray-800 h-40 overflow-y-auto scrollbar-thin">
                        <p>{mapsResult.text}</p>
                        <ul className="mt-2 space-y-1">
                            {mapsResult.chunks?.map((chunk, i) => chunk.maps ? (
                                <li key={i}><a href={chunk.maps.uri} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{chunk.maps.title}</a></li>
                            ) : null)}
                        </ul>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-50 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Flash-Lite Quick Assist</label>
                <div className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        value={qaQuery}
                        onChange={(e) => setQaQuery(e.target.value)}
                        placeholder="Quick dental terminology or calculation..." 
                        className="flex-1 border rounded px-2 py-1"
                    />
                    <button 
                        onClick={handleQuickAnswer} 
                        disabled={isQa}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                    >
                        {isQa ? '...' : 'Ask'}
                    </button>
                </div>
                {qaResult && <div className="mt-2 p-2 bg-white border rounded text-xs text-gray-800">{qaResult}</div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchTools;