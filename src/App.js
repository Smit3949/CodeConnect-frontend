import { useState } from 'react';
import IDE from "./components/IDE";
import { Login, Logout } from "./components/auth/Auth0";
import { useAuth0 } from '@auth0/auth0-react'
import { Icon } from '@iconify/react';
import runIcon from './images/icons/run.svg';
import whiteboard24Regular from '@iconify/icons-fluent/whiteboard-24-regular';

function App() {
  const { isAuthenticated, user } = useAuth0();

  const runCode = () => {

  }

  const toggleModal = () => {

  }

  return (
    <div className="flex">
      <div className="h-screen flex flex-grow flex-col">
        <Header userInfo={user} runCode={runCode} isAuthenticated={isAuthenticated} toggleModal={toggleModal} />
        <IDE />
      </div>
    </div>
  );
}

export default App;

function Header({ runCode, toggleModal, isAuthenticated, userInfo }) {
  console.log(userInfo);
  const [toolTip, showToolTip] = useState(false);
  return (
    <div className=" bg-purple-standard flex py-2 px-2 justify-between items-center">
      <div className="flex items-center">
        <div className="h-7">
          <img className="h-full" src={'./logo.png'} alt="codeconnect logo" />
        </div>
      </div>
      <div className="flex items-center">
        <button className=" text-white mr-4" onClick={toggleModal}><Icon icon={whiteboard24Regular} className="text-orange-standard" height="28" /></button>
        <button onClick={runCode} className="bg-orange-standard flex items-center text-base font-medium rounded px-3 py-1 mr-2">
          <img className="h-3" src={runIcon} alt="run code icon" />
          <span className="ml-2">Run</span>
        </button>
        {
          isAuthenticated ?
            <Logout /> :
            <Login />
        }
        <div className="mx-1 relative">
          {
            isAuthenticated &&
            <img onMouseEnter={() => { showToolTip(true) }} onMouseLeave={() => { showToolTip(false) }} className="h-7 w-7 rounded-full" src={userInfo.picture} alt="user icon" />
          }
          {
            toolTip && isAuthenticated &&
            <div className="absolute z-50 top-full right-0 mt-2 text-center text-xs text-gray-200 bg-black mr-4 px-1">{userInfo.email}</div>
          }
        </div>
      </div>
    </div>
  )
}