import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START': return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS': return { ...state, loading: false, user: action.payload.user, accessToken: action.payload.accessToken, error: null };
    case 'AUTH_FAIL': return { ...state, loading: false, error: action.payload, user: null, accessToken: null };
    case 'LOGOUT': return { ...state, user: null, accessToken: null, loading: false };
    case 'UPDATE_USER': return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      if (state.accessToken) {
        try {
          const res = await api.get('/auth/me');
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: res.data.data.user, accessToken: state.accessToken } });
        } catch (err) {
          // Try refresh
          try {
            const refreshRes = await api.post('/auth/refresh');
            const newToken = refreshRes.data.data.accessToken;
            localStorage.setItem('accessToken', newToken);
            const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${newToken}` } });
            dispatch({ type: 'AUTH_SUCCESS', payload: { user: res.data.data.user, accessToken: newToken } });
          } catch {
            localStorage.removeItem('accessToken');
            dispatch({ type: 'LOGOUT' });
          }
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, accessToken } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, accessToken } });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    localStorage.removeItem('accessToken');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (data) => dispatch({ type: 'UPDATE_USER', payload: data });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be inside AuthProvider');
  return context;
};
