import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

/**
 * Variável que vai identificar se estamos atualizando o token ou não
 * Para evitar que várias tentativas de atualização simultâneas sejam feitas
 */
let isRefreshing = false;
// Todas as (fila) requisições que aconteceram que deram falha pelo token expirado
let failedRequestsQueue = [];

export function setupAPIClient(ctx = undefined) {
  // Pega todos os cookies
  let cookies = parseCookies(ctx);

  // Link útil para analisar o token: https://jwt.io/
  const api = axios.create({
    baseURL: 'http://localhost:3333',
    // Adicionando o Bearer Token sempre que utilizamos o axios para que todas as rotas tenham este cabeçalho por padrão
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  });
  
  /**
   * api.interceptors -> interceptar requisições e respostas
   *    Poremos interceptar uma requisição e executar uma ação antes de ir ao BE ou
   *    Poremos interceptar uma resposta e executar uma ação depois do retorno do BE
   * Quem me diz se o token está expirado, ou não, é o BE, logo, vamos interceptar a response
   * 
   * api.interceptors.response.use -> recebe dois parâmetros: o que fazer se a resposta der sucesso e o que fazer se der erro (AxiosError)
   */
  api.interceptors.response.use(response => {
    return response;
  }, (error: AxiosError) => {
    // Se o erro for 401 e 'token.expired', quero renovar o token
    if (error.response.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies(ctx);
  
        const { 'nextauth.refreshToken': refreshToken } = cookies;
        // Este config é toda a config que fizemos para o backend. Tem todas as informações possíveis para repetir uma requisição para o BE.
        const originalConfig = error.config
  
        // Para evitar que várias tentativas de atualização simultâneas sejam feitas
        if (!isRefreshing) {
          isRefreshing = true
          // Faz uma requisição à rota /refresh para gerar um novo token, passando o refreshToken por param
          api.post('/refresh', {
            refreshToken,
          }).then(response => {
            const { token } = response.data;
    
            // Setta novamente os cookies com o token novo
            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })
      
            // Setta novamente os cookies com o refreshToken novo
            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/'
            })
    
            // Decisão padrão para que sempre que fizermos o login, o Bearer Token seja settado
            api.defaults.headers['Authorization'] = `Bearer ${token}`;
  
            // ---- Dando certo o refresh token ----------------------------------------
            // Executar o método onSuccess para cada lista de req. falhadas para reenviar
            failedRequestsQueue.forEach(request => request.onSuccess(token))
            // Limpa a lista
            failedRequestsQueue = [];
          }).catch(err => {
            // ---- Dando erro no refresh token ----------------------------------------
            // Executar o método onFailure para cada lista de req. falhadas para rejeitar
            failedRequestsQueue.forEach(request => request.onFailure(err))
            // Limpa a lista
            failedRequestsQueue = [];
  
            // Se o processo está sendo feito pelo browser (verifica se um código está rodando do lado do cliente)
            if (process.browser) {
              signOut()
            }
          }).finally(() => {
            isRefreshing = false
          });
        }
  
        // Caso isRefreshing seja false, 
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              // Retentar a requisição com o novo token atualizado
              // originalConfig -> todas as conf. da requisição
              originalConfig.headers['Authorization'] = `Bearer ${token}`
  
              //Refazendo a chamada à API com as informações já vindas do originalConfig + o novo token
              resolve(api(originalConfig))
            },
            onFailure: (err: AxiosError) => {
              // Dando erro no refresh do token, rejeitando a requisição
              reject(err)
            } 
          })
        });
      } else {
        // Se o processo está sendo feito pelo browser (verifica se um código está rodando do lado do cliente)
        if (process.browser) {
          // Desloga o usuário quando o erro for 401 (não autorizado)
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }
  
    // Sempre que o usamos o interceptors do axios, se não cair em nenhum 'if' podemos 
    // deixar o erro do axios acontecendo para serem tratados dentro de catch
    return Promise.reject(error);
  });

  return api;
}