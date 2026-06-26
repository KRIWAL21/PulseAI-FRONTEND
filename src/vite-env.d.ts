/// <reference types="vite/client" />


// Add this interface to declare the SpeechRecognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

// Add this interface for the event object
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

// Add this interface for the error event object
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

// Tell the global 'window' object that these properties might exist
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}