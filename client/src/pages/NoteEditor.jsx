import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { HiOutlineSparkles, HiOutlineArrowLeft, HiOutlineCheck, HiOutlineTag } from 'react-icons/hi2';
import { TbWand, TbArrowsMaximize, TbPencilStar, TbMessageChatbot } from 'react-icons/tb';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './NoteEditor.css';

const NoteEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [aiLoading, setAiLoading] = useState('');
  const [aiPanel, setAiPanel] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const saveTimeout = useRef(null);

  useEffect(() => {
    if (!isNew) {
      api.get(`/notes/${id}`).then(res => {
        const note = res.data.data.note;
        setTitle(note.title);
        setContent(note.htmlContent || note.content || '');
      }).catch(() => toast.error('Note not found'));
    }
  }, [id, isNew]);

  // Auto-save with debounce
  const autoSave = useCallback(async (newTitle, newContent) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        const data = { title: newTitle || 'Untitled', content: newContent.replace(/<[^>]*>/g, ''), htmlContent: newContent };
        if (isNew && !window._noteId) {
          const res = await api.post('/notes', data);
          window._noteId = res.data.data.note._id;
          window.history.replaceState(null, '', `/notes/${window._noteId}`);
        } else {
          const noteId = window._noteId || id;
          await api.put(`/notes/${noteId}`, data);
        }
        setLastSaved(new Date());
      } catch (err) { /* silent fail */ }
      setSaving(false);
    }, 2000);
  }, [id, isNew]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    autoSave(e.target.value, content);
  };

  const handleContentChange = (value) => {
    setContent(value);
    autoSave(title, value);
  };

  // AI Features
  const handleAI = async (action) => {
    const text = content.replace(/<[^>]*>/g, '');
    if (!text.trim()) { toast.error('Write some content first'); return; }
    setAiLoading(action);
    setAiPanel(true);
    try {
      let res;
      switch (action) {
        case 'summarize': res = await api.post('/ai/summarize', { text }); setAiResult(res.data.data.summary); break;
        case 'expand': res = await api.post('/ai/expand', { text }); setAiResult(res.data.data.expanded); break;
        case 'rewrite': res = await api.post('/ai/rewrite', { text, tone: 'professional' }); setAiResult(res.data.data.rewritten); break;
        case 'suggest': res = await api.post('/ai/suggest', { text }); setAiResult(res.data.data.suggestion); break;
        default: break;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI feature failed. Check your API key.');
      setAiResult('');
    }
    setAiLoading('');
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="editor-page">
      <div className="editor-page__toolbar">
        <button className="btn-ghost" onClick={() => navigate('/notes')}><HiOutlineArrowLeft /> Back</button>
        <div className="editor-page__status">
          {saving ? <span className="editor-page__saving">Saving...</span> :
            lastSaved ? <span className="editor-page__saved"><HiOutlineCheck /> Saved</span> : null}
        </div>
        <div className="editor-page__ai-btns">
          <button className="btn-secondary" onClick={() => handleAI('summarize')} disabled={!!aiLoading}>
            <TbWand /> {aiLoading === 'summarize' ? '...' : 'Summarize'}
          </button>
          <button className="btn-secondary" onClick={() => handleAI('expand')} disabled={!!aiLoading}>
            <TbArrowsMaximize /> {aiLoading === 'expand' ? '...' : 'Expand'}
          </button>
          <button className="btn-secondary" onClick={() => handleAI('rewrite')} disabled={!!aiLoading}>
            <TbPencilStar /> {aiLoading === 'rewrite' ? '...' : 'Rewrite'}
          </button>
          <button className="btn-secondary" onClick={() => handleAI('suggest')} disabled={!!aiLoading}>
            <TbMessageChatbot /> {aiLoading === 'suggest' ? '...' : 'Continue'}
          </button>
        </div>
      </div>

      <div className="editor-page__main">
        <div className="editor-page__editor">
          <input className="editor-page__title" type="text" placeholder="Untitled" value={title} onChange={handleTitleChange} />
          <ReactQuill theme="snow" value={content} onChange={handleContentChange} modules={modules} placeholder="Start writing... Use [[note-name]] to link notes" />
        </div>

        {/* AI Panel */}
        {aiPanel && (
          <div className="editor-page__ai-panel glass-card">
            <div className="editor-page__ai-header">
              <h3><HiOutlineSparkles /> AI Result</h3>
              <button className="btn-ghost" onClick={() => setAiPanel(false)}>✕</button>
            </div>
            <div className="editor-page__ai-content">
              {aiLoading ? (
                <div className="editor-page__ai-loading"><span className="spinner" /> Thinking...</div>
              ) : (
                <div className="editor-page__ai-text">{aiResult}</div>
              )}
            </div>
            {aiResult && !aiLoading && (
              <div className="editor-page__ai-actions">
                <button className="btn-primary" onClick={() => { setContent(content + `<p>${aiResult}</p>`); toast.success('Inserted!'); }}>
                  Insert Below
                </button>
                <button className="btn-secondary" onClick={() => { setContent(`<p>${aiResult}</p>`); toast.success('Replaced!'); }}>
                  Replace All
                </button>
                <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(aiResult); toast.success('Copied!'); }}>
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
