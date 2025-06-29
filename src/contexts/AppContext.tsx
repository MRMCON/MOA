import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Client, PlannerPost, ContentItem, Task, User } from '../types';

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'ADD_PLANNER_POST'; payload: PlannerPost }
  | { type: 'UPDATE_PLANNER_POST'; payload: PlannerPost }
  | { type: 'DELETE_PLANNER_POST'; payload: string }
  | { type: 'ADD_CONTENT_ITEM'; payload: ContentItem }
  | { type: 'UPDATE_CONTENT_ITEM'; payload: ContentItem }
  | { type: 'DELETE_CONTENT_ITEM'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  user: null,
  clients: [],
  plannerPosts: [],
  contentItems: [],
  tasks: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
        plannerPosts: state.plannerPosts.filter(post => post.clientId !== action.payload),
        contentItems: state.contentItems.filter(item => item.clientId !== action.payload),
        tasks: state.tasks.filter(task => task.clientId !== action.payload),
      };
    case 'ADD_PLANNER_POST':
      return { ...state, plannerPosts: [...state.plannerPosts, action.payload] };
    case 'UPDATE_PLANNER_POST':
      return {
        ...state,
        plannerPosts: state.plannerPosts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
      };
    case 'DELETE_PLANNER_POST':
      return {
        ...state,
        plannerPosts: state.plannerPosts.filter(post => post.id !== action.payload),
      };
    case 'ADD_CONTENT_ITEM':
      return { ...state, contentItems: [...state.contentItems, action.payload] };
    case 'UPDATE_CONTENT_ITEM':
      return {
        ...state,
        contentItems: state.contentItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_CONTENT_ITEM':
      return {
        ...state,
        contentItems: state.contentItems.filter(item => item.id !== action.payload),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('moa-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('moa-data', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}