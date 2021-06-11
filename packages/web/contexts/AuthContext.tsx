/*
  Responsável por ter todas as informaçoes de contexto de autenticação
*/
import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies' 
import Router from 'next/router'

import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

// Tipo para autenticar o usuário
type SignInCredentials = {
  email: string;
  password: string;
}

// O que terá no contexto:
/**
 * Método signIn
 * Método signOut
 * User
 * isAuthenticated
 */
type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode; //Tipagem que colocamos qndo o componente pode receber qlqr coisa dentro (números, componentes, contextos...)
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut() {
  // contexto: undefined, pq estamos executando pelo lado do browser
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  authChannel.postMessage('signOut');

  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }
    }
  }, [])

  useEffect(() => {
    // Busca todos os cookies pelo parseCookies do "nookies"
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api.get('/me')
        .then(response => {
          const { email, permissions, roles } = response.data
          console.log('/Me >>> ', email, permissions, roles);
          setUser({ email, permissions, roles })
        })
        .catch(() => {
          signOut();
        })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    console.log('Sign In >>> ', email, password);

    try {
      // Chamando a API para iniciar a sessão
      const response = await api.post('sessions', {
        email,
        password,
      })

      console.log('Response >>>', response?.data);

      const { token, refreshToken, permissions, roles } = response.data;

      /**
       * Precisamos manter as informações acima mesmo que o usuário atualize a página
       * Podemos usar algumas estratégias:
       *   - localStorage: podemos sair do app e até sair do computador que vai manter, porém, não temos localStorage em serverside rendering.
       *      -> localStorage existe apenas pelo clientside
       *   - sessionStorage: ele não fica disponível em outras sessões. Saiu da aplicação, apagou os dados
       *   - cookies: podem ser usados e acessados pelo lado do servidor ou cliente
       */

      //document.cookie
      
      // Usando a biblioeca "nookies"
      /**
       * @params: 
       *  contexto: undefined, pq estamos executando pelo lado do browser
       *  nome do token
       *  valor do token
       */
      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days - qnto tempo queremos o cookie salvo no navegador
        path: '/' // Quais caminhos da aaplicação tem acesso ao cookie? '/' toda a aplicação.
      })

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      //Salvando o usuário no contexto
      setUser({
        email,
        permissions,
        roles,
      })

      // Decisão padrão para que sempre que fizermos o login, o Bearer Token seja settado
      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}