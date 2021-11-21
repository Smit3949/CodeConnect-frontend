import React from 'react'
import { useAuth0 } from '@auth0/auth0-react';
import ReactGA from 'react-ga';
import rightArrow from '../../images/icons/right-arrow.png'
import { Tooltip } from '@chakra-ui/tooltip';

export function Login() {
    const { loginWithRedirect } = useAuth0();
    return (
        <div onClick={() => {
            ReactGA.event({
                category: `button.clicked`,
                action: `Login`,
            });
            loginWithRedirect()
        }} className="  w-full shadow-none hover:shadow-md flex justify-between duration-150 px-4 py-2 rounded-lg text-white bg-theme-teal-dark border border-transparent cursor-pointer font-semibold">
            <span>Login</span>
            <img className=" h-6 transform rotate-90 " src={rightArrow} alt="Right Arrow Login" />
        </div>
    )
}

export function Logout() {
    const { logout } = useAuth0();
    return (
        <div onClick={() => {
            ReactGA.event({
                category: `button.clicked`,
                action: `Logout`,
            });
            logout({
                returnTo: window.location.origin
            })
        }} className="  w-auto shadow-none hover:shadow-md flex justify-between duration-150 rounded-full text-center text-theme-teal-dark bg-white border-transparent cursor-pointer font-semibold">
            <Tooltip label="Logout" hasArrow fontSize="md" bg="teal.600">
                <img className=" h-8 transform -rotate-90 " src={rightArrow} alt="Right Arrow Login" />
            </Tooltip>
        </div>
    )
}