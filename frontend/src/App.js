import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/SignUp/SignupPage"
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Sidebar from "./Components/common/SideBar";
import RightPanel from "./Components/common/RightPannel";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./Components/common/LoadingSpinner";
import { base_URL } from "./contant/url";

function App() {
	const { data: authUser, isLoading } = useQuery({
		
		queryKey: ["authUser"], 
		queryFn: async () => {
			try {  
				const res = await fetch(`${base_URL}/api/auth/me`,{
					method:"GET",
					credentials:"include",
					headers:{
						"Content-Type":"application/json",

					}
				});
				const data = await res.json();

				if(data.error){
					return null
				} 
				if(!res.ok){
					throw new Error(data.error || "Something Went Wrong")
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='flex max-w-6xl mx-auto'>
		
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> :<Navigate to="/login"/> } />
				<Route path='/login' element={!authUser ?<LoginPage />: <Navigate to="/"/> } />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/"/>} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login"/>} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> :<Navigate to="/login"/>} />
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App;