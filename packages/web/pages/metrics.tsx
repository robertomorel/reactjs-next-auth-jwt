import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth"

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  )
}

/**
 * Do lado do servidor só temos acesso ao token do usuário, utilizando o contexto.
 * Então apenas o token tem informações do usuário em si
 */
const getSSRInfo = async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');

  return {
    props: {}
  }
};

const objPermAndRoles = {
  permissions: ['metrics.list3'],
  roles: ['administrator'],
};

/*
export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');

  return {
    props: {}
  }
}, {
  permissions: ['metrics.list3'],
  roles: ['administrator'],
})
*/

export const getServerSideProps = withSSRAuth(getSSRInfo, objPermAndRoles)