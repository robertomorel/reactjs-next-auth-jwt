/**
 * Assinatura do token para que só o BE o conheça
 * para que ninguém consiga alterar o conteúdo do token
 * 
 * Este secret é necessário para a criação de qualquer token
 */
export const auth = {
  secret: 'supersecret'
} as const;