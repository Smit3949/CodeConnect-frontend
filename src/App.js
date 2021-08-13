import { Login, Logout } from "./components/auth/Auth0";
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { isAuthenticated, user } = useAuth0();
  return (
    <div className="">
      {
        isAuthenticated ? <Logout /> : <Login />
      }
      {
        isAuthenticated &&
        user.email
      }
    </div>
  );
}

export default App;
