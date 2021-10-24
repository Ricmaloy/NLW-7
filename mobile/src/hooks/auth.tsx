import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import * as AuthSessions from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../services/api';

const CLIENT_ID = 'b1c1434c4772f53ce8a8';
const SCOPE = 'read:user';

const USER_STORAGE = '@dowhile:user';
const TOKEN_STORAGE = '@dowhile:token';

type AuthResponseProps = {
    token: string,
    user: UserProps,
}

type AuthrizationResponse = {
    params: {
        code?: string,
        serviceType?: 'web' | 'mobile',
        error?: string,
    },
    type?: string
}

interface UserProps {
    id: string,
    avatar_url: string,
    name: string,
    login: string,
}

interface AuthContextProps {
    user: UserProps | null,
    isSigningIn: boolean,
    signIn: () => Promise<void>,
    signOut: () => Promise<void>
}

type AuthProviderPros = {
    children: ReactNode
}

export const AuthContext = createContext({} as AuthContextProps);

function AuthProvider({children}: AuthProviderPros) {
    const [isSigningIn, setIsSigningIn] = useState(true);
    const [user, setUser] = useState<UserProps | null>(null);

    
    async function signIn() {
        try {
            setIsSigningIn(true);
    
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`
            const authSessionResponse = await AuthSessions.startAsync({ authUrl }) as AuthrizationResponse;
    
            if(authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied') {
                const authResponse = await api.post<AuthResponseProps>('/authenticate', { code: authSessionResponse.params.code,  serviceType: 'mobile' });
    
                const { user, token } = authResponse.data;

                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
                await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
                await AsyncStorage.setItem(TOKEN_STORAGE, token);
    
                setUser(user);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsSigningIn(false);
        }
    }

    async function signOut() {
        setUser(null);
        await AsyncStorage.removeItem(USER_STORAGE);
        await AsyncStorage.removeItem(TOKEN_STORAGE);
    }

    useEffect(() => {
        async function loadUserStorageData() {
            const userStorage = await AsyncStorage.getItem(USER_STORAGE);
            const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);

            if(userStorage && tokenStorage) {
                api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage}`;

                setUser(JSON.parse(userStorage));
            }

            setIsSigningIn(false);
        }

        loadUserStorageData();
    }, [])

    return (
        <AuthContext.Provider value={{
            signIn,
            signOut,
            isSigningIn,
            user
        }} 
        >
            { children } 
        </AuthContext.Provider>
    )
}

function useAuth() {
    const context = useContext(AuthContext)

    return context;
}

export { AuthProvider, useAuth }