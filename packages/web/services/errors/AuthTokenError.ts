/**
 * Não estamos usando a classe Error do próprio JS
 * Esamos criando uma classe de erro para poder diferenciar um erro do outro
 */
export class AuthTokenError extends Error {
  constructor() {
    // Indicar o tipo de erro
    super('Error with authentication token.');
  }
}