'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InterviewSession, Message, ClaudeResponse, Feedback } from '@/types/interview';
import ProgressHeader from '@/components/ProgressHeader';
import ChatBubble from '@/components/ChatBubble';
import FeedbackCard from '@/components/FeedbackCard';

interface ChatItem {
  type: 'message' | 'feedback';
  message?: { role: 'ai' | 'user'; content: string };
  feedback?: Feedback;
  questionNumber?: number;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatItems, isLoading]);

  // ================= LOAD SESSION =================
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/session?id=${sessionId}`);
        if (!res.ok) throw new Error('Session not found');
        const data = await res.json();
        setSession(data);
      } catch {
        setError('Gagal memuat sesi interview.');
      }
    }
    loadSession();
  }, [sessionId]);

  // ================= FIRST QUESTION =================
  const fetchFirstQuestion = useCallback(async () => {
    if (!session || hasInitialized.current) return;

    hasInitialized.current = true;
    setIsLoading(true);

    try {
      const init: Message[] = [
        { role: 'user', content: 'Mulai interview. Berikan pertanyaan pertama.' },
      ];

      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: init,
          role: session.role,
          level: session.level,
          name: session.name,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error('Failed to start');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      fullText += decoder.decode();

      let parsed: ClaudeResponse;

      try {
        parsed = JSON.parse(fullText);
      } catch {
        throw new Error('Invalid AI response');
      }

      setCurrentQuestion(parsed.qn);

      setMessages([
        ...init,
        { role: 'assistant', content: parsed.question || '' },
      ]);

      setChatItems([
        {
          type: 'message',
          message: { role: 'ai', content: parsed.question || '' },
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memulai interview.');
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionId]);

  useEffect(() => {
    fetchFirstQuestion();
  }, [fetchFirstQuestion]);

  // ================= SUBMIT ANSWER =================
  const submitAnswer = async () => {
    if (!input.trim() || isLoading || isDone || !session) return;

    const userAnswer = input.trim();
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: userAnswer };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);

    setChatItems((prev) => [
      ...prev,
      { type: 'message', message: { role: 'user', content: userAnswer } },
    ]);

    setIsLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          role: session.role,
          level: session.level,
          name: session.name,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      fullText += decoder.decode();

      let parsed: ClaudeResponse;

      try {
        parsed = JSON.parse(fullText);
      } catch {
        throw new Error('Invalid AI response');
      }

      setCurrentQuestion(parsed.qn);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: parsed.question || '' },
      ]);

      setChatItems((prev) => {
        const newItems: ChatItem[] = [];

        if (parsed.feedback) {
          newItems.push({
            type: 'feedback',
            feedback: parsed.feedback,
            questionNumber: parsed.qn,
          });
        }

        if (parsed.question) {
          newItems.push({
            type: 'message',
            message: { role: 'ai', content: parsed.question },
          });
        }

        const updated = [...prev, ...newItems];

        // ================= FINAL RESULT =================
        if (parsed.done) {
          const feedbacks = updated
            .filter((i) => i.type === 'feedback' && i.feedback)
            .map((i) => i.feedback!);

          const avg = (key: keyof Feedback['scores']) =>
            feedbacks.length
              ? feedbacks.reduce((s, f) => s + f.scores[key], 0) /
                feedbacks.length
              : 0;

          fetch('/api/session', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: sessionId,
              status: 'completed',
              overall_score: parsed.total || 0,
              final_summary: parsed.final || '',
              avg_technical: Math.round(avg('technical') * 10) / 10,
              avg_clarity: Math.round(avg('clarity') * 10) / 10,
              avg_relevance: Math.round(avg('relevance') * 10) / 10,
            }),
          });

          setIsDone(true);

          setTimeout(() => {
            router.push(`/results/${sessionId}`);
          }, 3000);
        }

        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendapatkan respons.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  // ================= UI STATES =================
  if (error && !session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Loading session...
      </main>
    );
  }

  // ================= UI =================
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <ProgressHeader
        role={session.role}
        level={session.level}
        currentQuestion={currentQuestion}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl mx-auto w-full">
        {chatItems.map((item, idx) => {
          if (item.type === 'message' && item.message) {
            return (
              <ChatBubble
                key={idx}
                role={item.message.role}
                content={item.message.content}
                senderName={item.message.role === 'user' ? session.name : 'AI'}
              />
            );
          }

          if (item.type === 'feedback' && item.feedback) {
            return (
              <FeedbackCard
                key={idx}
                feedback={item.feedback}
                questionNumber={item.questionNumber || 0}
              />
            );
          }

          return null;
        })}

        {isLoading && <ChatBubble role="ai" content="" isLoading />}

        {isDone && (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-white">
              Interview Selesai 🎉
            </h3>
            <p className="text-gray-400">Redirecting...</p>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {!isDone && (
        <div className="border-t border-white/10 px-6 py-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={3}
              placeholder="Ketik jawaban..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
            />

            <button
              onClick={submitAnswer}
              disabled={!input.trim() || isLoading}
              className="px-6 bg-primary text-white rounded-xl"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </main>
  );
}