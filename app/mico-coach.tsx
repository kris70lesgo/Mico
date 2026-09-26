"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, MessageCircle, Mic, MicOff, Send, Sparkles, Volume2, VolumeX, X } from "lucide-react";

type RecognitionAlternative = { transcript: string };
type RecognitionEvent = { results: ArrayLike<ArrayLike<RecognitionAlternative>> };
type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type CoachContext = {
  page?: string;
  workspace?: string;
  lesson?: string;
  activity?: string;
  objective?: string;
  concept?: string;
  weakTopics: string[];
  mastery?: number;
};

type Message = { role: "coach" | "learner"; content: string };
export type CoachAction = {
  type: "open_atlas" | "open_practice" | "atlas_show_system" | "atlas_show_all" | "atlas_reset";
  label: string;
  concept?: string;
  system?: string;
  execute?: boolean;
};

const atlasSystemAliases: Record<string, string[]> = {
  skeletal: ["skeleton", "skeletal", "bones", "bone"],
  muscular: ["muscle", "muscles", "muscular"],
  nervous: ["nervous", "nerves", "nerve"],
  cardiac: ["heart", "cardiac"],
  respiratory: ["respiratory", "lungs", "lung"],
  digestive: ["digestive", "digestive system"],
  arterial: ["arteries", "arterial"],
  venous: ["veins", "venous"],
  urinary: ["urinary", "kidneys", "kidney"],
  lymphatic: ["lymphatic", "lymph"],
  endocrine: ["endocrine"],
  reproductive: ["reproductive"],
  sensory: ["sensory", "sense organs"],
  connective: ["connective", "connective tissue"],
  integumentary: ["skin", "body surface", "integumentary"],
};

function atlasCommand(question: string, context: CoachContext): CoachAction | null {
  if (context.page !== "3D Atlas") return null;
  const normalized = question.toLowerCase();
  const isCommand = /\b(show|display|focus on|isolate|hide|turn on|view|reset|start over)\b/.test(normalized);
  if (!isCommand) return null;
  if (/\b(show|display|turn on)\b.*\b(all|everything)\b/.test(normalized)) {
    return { type: "atlas_show_all", label: "Showing all body systems", execute: true };
  }
  if (/\b(reset|start over)\b/.test(normalized)) {
    return { type: "atlas_reset", label: "Resetting the Atlas view", execute: true };
  }
  for (const [system, aliases] of Object.entries(atlasSystemAliases)) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      const label = system === "nervous" ? "nervous system" : aliases[0];
      return { type: "atlas_show_system", system, label: `Showing only the ${label}`, execute: true };
    }
  }
  return null;
}

const prompts = [
  { label: "Explain this", question: "Explain the current concept simply, using a visual analogy if helpful." },
  { label: "Quiz me", question: "Give me one short multiple-choice recall question about the current concept. Do not reveal the answer until I respond." },
  { label: "What next?", question: "Based on my current progress, tell me the one anatomy concept I should practice next and why." },
];

export default function MicoCoach({
  context,
  onExplore,
  onPractice,
  onAtlasAction,
}: {
  context: CoachContext;
  onExplore?: (concept?: string) => void;
  onPractice?: () => void;
  onAtlasAction?: (action: CoachAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [actions, setActions] = useState<CoachAction[]>([]);
  const [error, setError] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(true);
  const transcript = useRef<HTMLDivElement>(null);
  const recognition = useRef<BrowserSpeechRecognition | null>(null);

  const speak = (answer: string) => {
    if (!voiceReplies || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.rate = 0.96;
    utterance.pitch = 1.04;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const browser = window as typeof window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    setVoiceSupported(Boolean(browser.SpeechRecognition ?? browser.webkitSpeechRecognition));
    return () => {
      recognition.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const greeting = context.page === "3D Atlas"
    ? `I can see the Atlas state. Ask me to explain what is visible, or say “show me the nervous system.”`
    : context.concept
    ? `I’m here to help with ${context.concept}. Want a quick explanation or a mini-quiz?`
    : "I can explain anatomy, quiz you, or point you to the best next practice.";

  useEffect(() => {
    if (open) transcript.current?.scrollTo({ top: transcript.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const startListening = () => {
    const browser = window as typeof window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setError("Voice input is not available in this browser. You can still type to Mico.");
      return;
    }
    if (listening) {
      recognition.current?.stop();
      return;
    }
    setError("");
    const session = new Recognition();
    recognition.current = session;
    session.lang = navigator.language || "en-US";
    session.continuous = false;
    session.interimResults = false;
    session.maxAlternatives = 1;
    session.onstart = () => setListening(true);
    session.onend = () => setListening(false);
    session.onerror = (event) => {
      setListening(false);
      if (event.error !== "aborted") setError(event.error === "not-allowed" ? "Microphone access is needed for voice chat." : "I could not hear that clearly. Please try again.");
    };
    session.onresult = (event) => {
      const spoken = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (!spoken) return;
      setInput(spoken);
      void ask(spoken);
    };
    session.start();
  };

  const ask = async (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;
    setError("");
    setActions([]);
    setInput("");
    setMessages((current) => [...current, { role: "learner", content: cleanQuestion }]);
    setLoading(true);
    const directAtlasCommand = atlasCommand(cleanQuestion, context);
    if (directAtlasCommand) onAtlasAction?.(directAtlasCommand);
    try {
      const response = await fetch("/api/mico-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: cleanQuestion, context, history: messages.slice(-6) }),
      });
      const data = (await response.json()) as { answer?: string; actions?: CoachAction[]; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error ?? "Mico Coach could not answer.");
      const nextActions = Array.isArray(data.actions) ? data.actions.slice(0, 2) : [];
      const executableAction = nextActions.find((action) => action.execute && action.type.startsWith("atlas_"));
      if (executableAction) onAtlasAction?.(executableAction);
      setMessages((current) => [...current, { role: "coach", content: data.answer as string }]);
      speak(data.answer as string);
      setActions(nextActions.filter((action) => action !== executableAction));
    } catch (cause) {
      if (directAtlasCommand) {
        setMessages((current) => [...current, { role: "coach", content: `${directAtlasCommand.label}. I can still control the Atlas even while my explanation service is unavailable.` }]);
      } else {
        setError(cause instanceof Error ? cause.message : "Mico Coach could not answer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(input);
  };

  const runAction = (action: CoachAction) => {
    if (action.type === "open_atlas") onExplore?.(action.concept ?? context.concept);
    if (action.type === "open_practice") onPractice?.();
    if (action.type.startsWith("atlas_")) onAtlasAction?.(action);
    setOpen(false);
  };

  return (
    <aside className={`mico-coach ${open ? "open" : ""}`} aria-label="Mico Coach">
      {open && (
        <section className="mico-coach-panel" role="dialog" aria-label="Chat with Mico Coach">
          <header>
            <span className="mico-coach-avatar"><Bot size={20} /></span>
            <span><b>Mico Coach</b><small><i /> AI anatomy tutor</small></span>
            <button type="button" onClick={() => { setVoiceReplies((value) => !value); window.speechSynthesis?.cancel(); }} aria-label={voiceReplies ? "Mute Mico voice" : "Turn on Mico voice"} title={voiceReplies ? "Mute Mico voice" : "Turn on Mico voice"}>{voiceReplies ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Mico Coach"><X size={19} /></button>
          </header>
          <div className="mico-coach-context">
            <Sparkles size={15} /> {context.page === "3D Atlas" ? `Working in the 3D Atlas · ${context.concept ?? "whole-body model"}` : context.concept ? `Studying ${context.concept}` : "Personalized to your learning path"}
          </div>
          <div className="mico-coach-transcript" ref={transcript} aria-live="polite">
            <article className="coach"><Bot size={15} /><p>{greeting}</p></article>
            {messages.map((message, index) => (
              <article className={message.role} key={`${message.role}-${index}`}>
                {message.role === "coach" && <Bot size={15} />}
                <p>{message.content}</p>
              </article>
            ))}
            {loading && <article className="coach thinking"><Bot size={15} /><p><span /> <span /> <span /></p></article>}
          </div>
          {actions.length > 0 && (
            <div className="mico-coach-actions">
              {actions.map((action, index) => (
                <button type="button" key={`${action.type}-${index}`} onClick={() => runAction(action)}>
                  <Sparkles size={14} /> {action.label}
                </button>
              ))}
            </div>
          )}
          {messages.length === 0 && (
            <div className="mico-coach-prompts">
              {prompts.map((prompt) => <button type="button" key={prompt.label} onClick={() => void ask(prompt.question)}>{prompt.label}</button>)}
            </div>
          )}
          {error && <p className="mico-coach-error">{error}</p>}
          <form onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={600} placeholder="Ask about this anatomy…" aria-label="Ask Mico Coach" />
            <button className={`mico-coach-mic ${listening ? "listening" : ""}`} type="button" onClick={startListening} disabled={loading} aria-label={listening ? "Stop listening" : "Talk to Mico"} title={voiceSupported ? "Talk to Mico" : "Voice input is not supported in this browser"}>
              {listening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send question"><Send size={17} /></button>
          </form>
          <footer>{voiceSupported ? "Tap the mic to speak · Educational support only · Not medical advice" : "Voice input works in supported browsers · Educational support only · Not medical advice"}</footer>
        </section>
      )}
      <button className="mico-coach-launcher" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? <ChevronDown size={21} /> : <MessageCircle size={21} />}
        <span>{open ? "Hide coach" : "Ask Mico"}</span>
        {!open && <i>AI</i>}
      </button>
    </aside>
  );
}
