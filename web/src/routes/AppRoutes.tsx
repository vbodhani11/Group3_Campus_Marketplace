import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Account from '../pages/Account'
import ForgotPassword from "../pages/ForgotPassword"
import Listings from "../pages/Listings"
import Sell from "../pages/Sell"
import Messages from "../pages/Messages"

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/account', element: <Account /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/listings", element: <Listings /> },
  { path: "/sell", element: <Sell /> },
  { path: "/messages", element: <Messages /> },
])

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
