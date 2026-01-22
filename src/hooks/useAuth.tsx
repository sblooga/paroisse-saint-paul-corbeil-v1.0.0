// Transitional wrapper to use backend JWT auth everywhere the old useAuth was imported.
import { BackendAuthProvider, useBackendAuth } from './useBackendAuth';

export const AuthProvider = BackendAuthProvider;
export const useAuth = useBackendAuth;
