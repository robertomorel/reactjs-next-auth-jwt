import { GetServerSideProps } from 'next';
import { FormEvent, useContext, useState } from 'react'
import { parseCookies } from 'nookies'

import { AuthContext } from '../contexts/AuthContext';
import styles from '../styles/Home.module.css'
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    // Para evitar o comportamento default de dar um refresh na tela desnecessariamente
    event.preventDefault();

    const data = {
      email,
      password,
    }

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )
}

//Método que será usado pelo servidor (getServerSideProps)
export const getServerSideProps = withSSRGuest(async (ctx) => {
  console.log('Cokkies >>> ', ctx.req.cookies);

  // Comentando o códgo abaixo, pois esta verificação ficará sob resp. da função "withSSRGuest"
  /*
  // Desta vez passamos o contexto por param pq estamos acessando pelo serverside
  const cookies = parseCookies(ctx);

  // Se identificar que já existe token válido, já redireciona para o dashboard
  if(cookies['nextauth.token']) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      }
    }
  }
  */

  return {
    props: {}
  }
});