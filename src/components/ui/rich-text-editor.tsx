import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from './button';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Smile,
  Play,
  FileAudio,
  FileDown,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const compressImage = async (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', quality);
    };
    img.src = URL.createObjectURL(file);
  });
};

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Commencez a ecrire...',
  className,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        align: { default: 'center' },
        size: { default: 'md' },
      };
    },
    renderHTML({ HTMLAttributes }) {
      const align = HTMLAttributes.align || 'center';
      const size = HTMLAttributes.size || 'md';
      const alignClass =
        align === 'left' ? 'float-left mr-4' :
        align === 'right' ? 'float-right ml-4' : 'mx-auto';
      const sizeClass =
        size === 'sm' ? 'max-w-xs' :
        size === 'lg' ? 'max-w-full' : 'max-w-md';
      const classList = `${alignClass} ${sizeClass} h-auto rounded-md my-4`;
      return ['img', { ...HTMLAttributes, class: classList }];
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { HTMLAttributes: { class: 'list-disc pl-6 space-y-1' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal pl-6 space-y-1' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-primary pl-4 italic my-4' } },
        paragraph: { HTMLAttributes: { class: 'mb-2' } },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      CustomImage.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_p]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h1]:font-playfair [&_h2]:font-playfair [&_h3]:font-playfair [&_p]:font-sans',
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptees');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5Mo)');
      return;
    }
    try {
      toast.loading('Telechargement de l’image...');
      let fileToUpload: Blob | File = file;
      if (!file.type.includes('gif')) fileToUpload = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `articles/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, fileToUpload, {
        contentType: 'image/webp',
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      toast.dismiss();
      toast.success('Image ajoutee');
    } catch (error) {
      toast.dismiss();
      toast.error('Erreur lors du telechargement');
      console.error(error);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const insertEmoji = () => {
    const emoji = window.prompt('Emoji a inserer (ex: 🙂 🙏 ❤️) :');
    if (emoji) editor.chain().focus().insertContent(emoji).run();
  };

  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(align).run();
  };

  const selectNearestImage = () => {
    const { state } = editor;
    const { $from } = state.selection;
    const nodeAfter = $from.nodeAfter;
    const nodeBefore = $from.nodeBefore;
    if (nodeAfter?.type.name === 'image') {
      editor.commands.setNodeSelection($from.pos);
      return true;
    }
    if (nodeBefore?.type.name === 'image') {
      const pos = $from.pos - nodeBefore.nodeSize;
      editor.commands.setNodeSelection(pos);
      return true;
    }
    return false;
  };

  const updateImageAttribute = (key: 'align' | 'size', value: string) => {
    if (!selectNearestImage()) return;
    editor.chain().focus().updateAttributes('image', { [key]: value }).run();
  };

  const deleteImage = () => {
    // plus utilisé (suppression via clavier)
    return;
  };

  const normalizeEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const gdMatch = url.match(/file\/d\/([^/]+)/);
    if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
    return url;
  };

  const normalizeAudioUrl = (url: string) => {
    const gdMatch = url.match(/file\/d\/([^/]+)/);
    if (gdMatch) return `https://drive.google.com/uc?export=download&id=${gdMatch[1]}`;
    return url;
  };

  const insertEmbed = (label: string) => {
    const url = window.prompt(`URL ${label} (YouTube, Drive, podcast, etc.) :`);
    if (!url) return;

    const lower = label.toLowerCase();

    if (lower.includes('fichier')) {
      editor
        .chain()
        .focus()
        .insertContent(
          `<p class="my-4"><a class="text-primary underline" href="${url}" target="_blank" rel="noopener noreferrer">Fichier Google Drive</a></p>`
        )
        .run();
      return;
    }

    if (lower.includes('podcast')) {
      const audioUrl = normalizeAudioUrl(url);
      editor
        .chain()
        .focus()
        .insertContent(
          `<audio class="my-4 w-full" controls><source src="${audioUrl}" />Votre navigateur ne supporte pas l'audio.</audio>`
        )
        .run();
      return;
    }

    const normalized = normalizeEmbedUrl(url);
    editor
      .chain()
      .focus()
      .insertContent(
        `<div class="embed-wrapper my-4 aspect-video"><iframe class="w-full h-full rounded-md" src="${normalized}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe></div>`
      )
      .run();
  };

  return (
    <div className={cn('border rounded-md bg-background', className)}>
      <style>{`.ProseMirror-selectednode { outline: 2px solid #2563eb; }`}</style>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent' : ''}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent' : ''}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-accent' : ''}>
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}>
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}>
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-accent' : ''}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-accent' : ''}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-accent' : ''}>
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => setTextAlign('left')} className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}>
          G
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setTextAlign('center')} className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}>
          C
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setTextAlign('right')} className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}>
          D
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setTextAlign('justify')} className={editor.isActive({ textAlign: 'justify' }) ? 'bg-accent' : ''}>
          J
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={addLink} className={editor.isActive('link') ? 'bg-accent' : ''}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertEmoji}>
          <Smile className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <Button type="button" variant="ghost" size="sm" onClick={() => updateImageAttribute('align', 'left')} className={editor.isActive('image') ? 'bg-accent' : ''}>
          G
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => updateImageAttribute('align', 'center')} className={editor.isActive('image') ? 'bg-accent' : ''}>
          C
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => updateImageAttribute('align', 'right')} className={editor.isActive('image') ? 'bg-accent' : ''}>
          D
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => updateImageAttribute('size', 'sm')} className={editor.isActive('image') ? 'bg-accent' : ''}>
          S
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => updateImageAttribute('size', 'md')} className={editor.isActive('image') ? 'bg-accent' : ''}>
          M
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => updateImageAttribute('size', 'lg')} className={editor.isActive('image') ? 'bg-accent' : ''}>
          L
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => insertEmbed('video (YouTube, Vimeo, etc.)')}>
          <Play className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertEmbed('podcast')}>
          <FileAudio className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => insertEmbed('fichier (Google Drive, PDF integre)')}>
          <FileDown className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
