<h2 align="center">
  NextJS using JWT Authentication
</h2>

<div align="center">
  <img alt="Next JS" src="https://img.shields.io/badge/nextjs-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"/>
  <img alt="NodeJS" src="https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node-dot-js&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
</div>

<div align="center">
  <img src="https://github.com/robertomorel/reactjs-next-auth-jwt/blob/master/assets/auth-jwt.jpeg?raw=true" width="700"/>
</div>

<hr />

## About
This project implements an example of how the frontend can handle with JWT auth general behavior. 
It has a simple backend attached just to be used as a model.

### Backend
Routes
- Post: `/sessions`
- Post: `/refresh`
- Get: `/me`

> The token is expired in every 15 min

### Frontend
- Login with token and refresh token generation 
  - Saving data in the cookies
- Logout
- Default strategy to handle the header of all requests (with Bearer Token)
- Server Side Rendering to control close access and free access
- Communication between Client Side and Server Side using cookies with context
- Context to centralize all auth rules, params, functions
- Redirecting user depending on the situation: logged in/out, token failure...

#### Acess ✒️
To login as an admin:
```bash
#permissions: ['users.list', 'users.create', 'metrics.list']
#roles: ['administrator']

# Email
admin@email.com

# Password
123456
```

To login as a guest:
```bash
#permissions: ['users.list', 'metrics.list']
#roles: ['editor']

# Email
guest@email.com

# Password
654321
```

## How to run
Run the following commands using lerna

```bash
# Clone the repository
git clone https://github.com/robertomorel/reactjs-next-auth-jwt.git

# Enter in the folder
cd /reactjs-next-auth-jwt

# Installing dependencies
yarn install

# Run
yarn start
```

## License

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE.md) para mais detalhes.

---

## Let´s Talk 🤩
[LinkedIn](https://www.linkedin.com/in/roberto-morel-6b9065193/)