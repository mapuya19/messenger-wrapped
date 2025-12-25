'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { WrappedData, ParsedMessage } from '@/types';

interface ChatDataState {
  wrappedData: WrappedData | null;
  isLoading: boolean;
  error: string | null;
  chatName: string | null;
}

type ChatDataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { data: WrappedData; chatName: string } }
  | { type: 'RESET' };

const initialState: ChatDataState = {
  wrappedData: null,
  isLoading: false,
  error: null,
  chatName: null,
};

function chatDataReducer(
  state: ChatDataState,
  action: ChatDataAction
): ChatDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DATA':
      return {
        ...state,
        wrappedData: action.payload.data,
        chatName: action.payload.chatName,
        isLoading: false,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface ChatDataContextValue {
  state: ChatDataState;
  dispatch: React.Dispatch<ChatDataAction>;
}

const ChatDataContext = createContext<ChatDataContextValue | undefined>(undefined);

export function ChatDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatDataReducer, initialState);

  return (
    <ChatDataContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatDataContext.Provider>
  );
}

export function useChatData() {
  const context = useContext(ChatDataContext);
  if (context === undefined) {
    throw new Error('useChatData must be used within a ChatDataProvider');
  }
  return context;
}

