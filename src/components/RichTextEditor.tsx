'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, List, Link2, Smile, Unlink } from 'lucide-react';

// ─── Emoji Picker ────────────────────────────────────────────────────────────

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Popularne',
    emojis: ['😀','😂','🥰','😎','🤔','😡','😭','🎉','🔥','⚡','💥','🏆','🎯','⚔️','🛡️','💀','👑','✅','❌','🚀'],
  },
  {
    label: 'Dota',
    emojis: ['🧙','🗡️','🏹','🔮','💎','🌑','🌕','🌊','🌩️','🪄','🐉','🦁','🐺','🦅','🕷️','🐝','🌿','💣','⏱️','💰'],
  },
  {
    label: 'Gesty',
    emojis: ['👍','👎','👏','🙌','🤝','✊','💪','🖐️','☝️','🤜','🤛','🫡','🙏','👀','👁️','🫶','❤️','💙','💚','🖤'],
  },
];

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [tab, setTab] = useState(0);
  return (
    <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            onClick={() => setTab(i)}
            className={`flex-1 text-xs font-bold py-2 transition-all ${tab === i ? 'bg-slate-800 text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-10 gap-0.5 p-3">
        {EMOJI_GROUPS[tab].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="text-xl w-8 h-8 rounded-lg hover:bg-slate-700 transition-all flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg transition-all text-sm ${
        active
          ? 'bg-red-600/30 text-red-400 border border-red-500/40'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const emojiRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-400 underline underline-offset-2 hover:text-red-300 transition-colors',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Wpisz treść wpisu…',
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:text-slate-600 before:float-left before:h-0 before:pointer-events-none',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm max-w-none min-h-[180px] px-4 py-3 text-slate-200 focus:outline-none leading-relaxed',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. when resetting / editing existing news)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const insertEmoji = useCallback(
    (emoji: string) => {
      editor?.commands.insertContent(emoji);
      setShowEmoji(false);
    },
    [editor]
  );

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href }).run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 overflow-visible focus-within:border-red-500/60 transition-all">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.07] flex-wrap">
        {/* Bold */}
        <ToolbarBtn
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Pogrubienie (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarBtn>

        {/* Bullet List */}
        <ToolbarBtn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista punktowana"
        >
          <List className="w-4 h-4" />
        </ToolbarBtn>

        <div className="w-px h-5 bg-slate-700 mx-1" />

        {/* Link */}
        <ToolbarBtn
          active={editor.isActive('link') || showLinkInput}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput((v) => !v);
            }
          }}
          title="Dodaj link"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarBtn>

        {/* Unlink */}
        {editor.isActive('link') && (
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Usuń link"
          >
            <Unlink className="w-4 h-4" />
          </ToolbarBtn>
        )}

        <div className="w-px h-5 bg-slate-700 mx-1" />

        {/* Emoji */}
        <div className="relative" ref={emojiRef}>
          <ToolbarBtn
            active={showEmoji}
            onClick={() => setShowEmoji((v) => !v)}
            title="Wstaw emoji"
          >
            <Smile className="w-4 h-4" />
          </ToolbarBtn>
          {showEmoji && <EmojiPicker onSelect={insertEmoji} />}
        </div>
      </div>

      {/* ── Link URL input ── */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07] bg-slate-900/60">
          <Link2 className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyLink()}
            placeholder="https://example.com"
            className="flex-1 bg-transparent text-slate-300 text-sm placeholder-slate-600 outline-none"
          />
          <button
            type="button"
            onClick={applyLink}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
          >
            Zastosuj
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />
    </div>
  );
}
