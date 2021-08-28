import React from 'react'
import { useAuth0 } from '@auth0/auth0-react';
import ReactGA from 'react-ga';

export function Login() {
    const { loginWithRedirect } = useAuth0();
    return (
        <div className=" text-white mx-1">
            <button onClick={() => {
                ReactGA.event({
                    category: `button.clicked`,
                    action: `Login`,
                });
                loginWithRedirect()
            }}>Login</button>
        </div>
    )
}

export function Logout() {
    const { logout } = useAuth0();
    return (
        <div className=" text-white mx-1">
            <button onClick={() => {
                ReactGA.event({
                    category: `button.clicked`,
                    action: `Logout`,
                });
                logout()
            }}>Logout</button>
        </div>
    )
}