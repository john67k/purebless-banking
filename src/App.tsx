import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Send from './pages/Send'
import TopUp from './pages/TopUp'
import Cashout from './pages/Cashout'
import Activity from './pages/Activity'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import KYC from './pages/KYC'
import PayIn4 from './pages/PayIn4'
import CardApplication from './pages/CardApplication'
import Loans from './pages/Loans'
import Checkout from './pages/Checkout'
import Receipt from './pages/Receipt'
import Risk from './pages/Risk'
import Receive from './pages/Receive'
import Invoices from './pages/Invoices'
import Checks from './pages/Checks'

function App() {
    return (
        <>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/Dashboard" element={<Dashboard />} />
                    <Route path="/Send" element={<Send />} />
                    <Route path="/TopUp" element={<TopUp />} />
                    <Route path="/Cashout" element={<Cashout />} />
                    <Route path="/Activity" element={<Activity />} />
                    <Route path="/Settings" element={<Settings />} />
                    <Route path="/Notifications" element={<Notifications />} />
                    <Route path="/KYC" element={<KYC />} />
                    <Route path="/PayIn4" element={<PayIn4 />} />
                    <Route path="/CardApplication" element={<CardApplication />} />
                    <Route path="/Loans" element={<Loans />} />
                    <Route path="/Checkout" element={<Checkout />} />
                    <Route path="/Receipt" element={<Receipt />} />
                    <Route path="/Risk" element={<Risk />} />
                    <Route path="/Receive" element={<Receive />} />
                    <Route path="/Invoices" element={<Invoices />} />
                    <Route path="/Checks" element={<Checks />} />
                </Routes>
            </Layout>
            <Analytics />
        </>
    )
}

export default App