'use client';

interface ChatBubbleProps {
  role: 'ai' | 'user';
  content: string;
  senderName?: string;
  isLoading?: boolean;
}

export default function ChatBubble({
  role,
  content,
  senderName,
  isLoading = false,
}: ChatBubbleProps) {
  const isAI = role === 'ai';

  if (isLoading) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start gap-3 max-w-[80%]">
          <img
            src="/logo.png"
            alt="logo"
            className="h-8 w-auto object-contain brightness-150"
          />
          <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`flex items-start gap-3 max-w-[80%] ${
          isAI ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${
            isAI
              ? <img
            src="/logo.png"
            alt="logo"
            className="h-8 w-auto object-contain brightness-150"
          />
              : <img
            src="/logo.png"
            alt="logo"
            className="h-8 w-auto object-contain brightness-150"
          />
          }`}
        >
          {isAI ? <img
            src="/logo.png"
            alt="logo"
            className="h-8 w-auto object-contain brightness-150"
          /> : senderName?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {/* Bubble */}
        <div
          className={`px-5 py-3.5 whitespace-pre-wrap leading-relaxed text-[15px] ${
            isAI
              ? 'bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm text-gray-200'
              : 'bg-primary rounded-2xl rounded-tr-sm text-white'
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
