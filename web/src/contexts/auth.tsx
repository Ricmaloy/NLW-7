import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/api';

type AuthResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string;
    }
}

interface AuthProviderProps {
    children: ReactNode;
}

type User = {
    id: string,
    name: string,
    login: string,
    avatar_url: string,
}

interface AuthContextProps {
    user: User | null;
    signInUrl: string;
    signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=f40a3a816c85f6f75ce1`;

    async function signIn(githubCode: string) {
        const response = await api.post<AuthResponse>('authenticate', {
            code: githubCode,
            serviceType: 'web'
        });

        const { token, user } = response.data;

        localStorage.setItem('@dowhile:token', token);

        api.defaults.headers.common.authorization = `Bearer ${token}`;

        setUser(user);
    };

    function signOut() {
        setUser(null);
        localStorage.removeItem("@dowhile:token");
    }

    useEffect(() => {
        const token = localStorage.getItem('@dowhile:token');

        if(token) {
            api.defaults.headers.common.authorization = `Bearer ${token}`;

            api.get<User>('profile').then(response => {
                setUser(response.data)
            })
        }
    }, []);

    useEffect(() => {
        const url = window.location.href;
        const hasGithubCode = url.includes('?code=');

        if(hasGithubCode) {
            const [ urlWithNoCode, githubCode ] = url.split('?code=');

            window.history.pushState({}, '', urlWithNoCode);

            signIn(githubCode);
        }
    }, []);

    return (
        <AuthContext.Provider value={{signInUrl, user, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}