import { useContext, useEffect } from "react"
import Router from 'next/router';

import { AuthContext } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth"
import { Can } from "../components/Can";

export default function Dashboard() {
  const { user, signOut, isAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response))
  }, [])

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Sign out</button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

//Método que será usado pelo servidor (getServerSideProps)
//Está sendo utilizada a função withSSRAuth
export const getServerSideProps = withSSRAuth(async (ctx) => {
  // Mandando o contexto para o setup do APIClient para termos acesso aos cookies
  // Isto é possível pq estamos rodando pelo lado do servidor
  const apiClient = setupAPIClient(ctx);
  //Assim, com o /me, temos as informações do Bearer Token
  const response = await apiClient.get('/me');

  console.log(response.data)

  return {
    props: {}
  }
})