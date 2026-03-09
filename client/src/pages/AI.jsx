import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineMagnifyingGlass, HiOutlineChatBubbleLeftRight, HiOutlineGlobeAlt, HiOutlineTag, HiOutlinePhoto } from 'react-icons/hi2';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './AI.css';

const AI = () => {
  const [activeTab, setActiveTab] = useState('ask');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      // Switch to vision tab if not already there
      setActiveTab('vision');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;
    setLoading(true);
    setResult(null);

    try {
      switch (activeTab) {
        case 'ask': {
          setChatHistory(prev => [...prev, { role: 'user', content: input }]);
          const res = await api.post('/ai/ask', { question: input });
          const answer = res.data.data;
          setChatHistory(prev => [...prev, { role: 'ai', content: answer.answer, sources: answer.sources }]);
          break;
        }
        case 'search': {
          const res = await api.get(`/ai/search?q=${encodeURIComponent(input)}`);
          setResult({ type: 'search', data: res.data.data.results });
          break;
        }
        case 'clip': {
          const res = await api.post('/ai/clip', { url: input });
          setResult({ type: 'clip', data: res.data.data });
          toast.success('Web page clipped and saved as note!');
          break;
        }
        case 'tags': {
          const res = await api.post('/ai/suggest-tags', { text: input });
          setResult({ type: 'tags', data: res.data.data.tags });
          break;
        }
        case 'vision': {
          const formData = new FormData();
          formData.append('image', selectedFile);
          formData.append('prompt', input || 'Analyze this image in detail');
          const res = await api.post('/ai/analyze-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setResult({ type: 'vision', data: res.data.data.analysis });
          break;
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI request failed');
    }
    setLoading(false);
    if (activeTab !== 'ask' && activeTab !== 'vision') setInput('');
  };

  const tabs = [
    { id: 'ask', label: 'Ask AI', icon: <HiOutlineChatBubbleLeftRight />, placeholder: 'Ask a question about your notes...' },
    { id: 'search', label: 'Smart Search', icon: <HiOutlineMagnifyingGlass />, placeholder: 'Semantic search across all notes...' },
    { id: 'clip', label: 'Web Clipper', icon: <HiOutlineGlobeAlt />, placeholder: 'Paste a URL to clip...' },
    { id: 'vision', label: 'Image Insights', icon: <HiOutlinePhoto />, placeholder: 'Describe what you want to know about this image...' },
    { id: 'tags', label: 'Auto-Tag', icon: <HiOutlineTag />, placeholder: 'Paste text to get tag suggestions...' },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="ai-page">
      <div className="ai-page__header">
        <div className="ai-page__header-icon"><HiOutlineSparkles /></div>
        <div>
          <h1 className="ai-page__title">AI Assistant</h1>
          <p className="ai-page__subtitle">Powered by Google Gemini with RAG</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="ai-page__tabs">
        {tabs.map(tab => (
          <button key={tab.id}
            className={`ai-page__tab ${activeTab === tab.id ? 'ai-page__tab--active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setResult(null); }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Chat/Results Area */}
      <div className="ai-page__content glass-card">
        {activeTab === 'ask' && (
          <div className="ai-page__chat">
            {chatHistory.length === 0 && (
              <div className="ai-page__empty">
                <HiOutlineSparkles />
                <p>Ask questions about your notes. AI will find relevant notes and answer based on your knowledge base.</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <motion.div key={i} className={`ai-page__message ai-page__message--${msg.role}`}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="ai-page__message-content">{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="ai-page__sources">
                    <span>Sources:</span>
                    {msg.sources.map(s => <span key={s.id} className="badge">{s.title}</span>)}
                  </div>
                )}
              </motion.div>
            ))}
            {loading && <div className="ai-page__thinking"><span className="spinner" /> Searching your notes & thinking...</div>}
          </div>
        )}

        {activeTab === 'search' && result?.type === 'search' && (
          <div className="ai-page__results">
            {result.data.map(note => (
              <div key={note._id} className="ai-page__result-item">
                <h4>{note.title}</h4>
                <p>{note.content?.replace(/<[^>]*>/g, '').slice(0, 200)}</p>
                {note.score && <span className="badge">Score: {(note.score * 100).toFixed(1)}%</span>}
              </div>
            ))}
            {result.data.length === 0 && <p className="ai-page__no-results">No results found.</p>}
          </div>
        )}

        {activeTab === 'vision' && (
          <div className="ai-page__vision">
            {filePreview && (
              <div className="ai-page__vision-preview glass-card">
                <img src={filePreview} alt="Preview" />
                <button className="ai-page__vision-remove" onClick={() => { setSelectedFile(null); setFilePreview(null); }}>✕</button>
              </div>
            )}
            {!filePreview && (
              <div className="ai-page__empty">
                <HiOutlinePhoto />
                <p>Upload an image to analyze, extract text, or ask questions about it.</p>
                <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>Upload Image</button>
              </div>
            )}
            {result?.type === 'vision' && (
              <div className="ai-page__vision-result">
                <h4><HiOutlineSparkles /> AI Analysis</h4>
                <div className="ai-page__vision-text">{result.data}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clip' && result?.type === 'clip' && (
          <div className="ai-page__clip-result">
            <h4>✅ Clipped: {result.data.clipped.title}</h4>
            <p>{result.data.clipped.summary}</p>
            {result.data.clipped.tags.length > 0 && (
              <div className="ai-page__clip-tags">
                {result.data.clipped.tags.map((t, i) => <span key={i} className="badge">{t}</span>)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && result?.type === 'tags' && (
          <div className="ai-page__tag-results">
            <h4>Suggested Tags:</h4>
            <div className="ai-page__tag-list">
              {result.data.map((tag, i) => <span key={i} className="badge">{tag}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form className="ai-page__input-area" onSubmit={handleSubmit}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
        <button type="button" className={`btn-icon ${selectedFile ? 'has-file' : ''}`} onClick={() => fileInputRef.current.click()}>
          <HiOutlinePhoto />
        </button>
        <input type="text" className="input" placeholder={activeTabData.placeholder} value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
        <button type="submit" className="btn-primary" disabled={loading || (!input.trim() && !selectedFile)}>
          {loading ? <span className="spinner" /> : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AI;
