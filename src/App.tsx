import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Overview } from './pages/Overview'
import { Bets } from './pages/Bets'
import { Members } from './pages/Members'
import { Settlements } from './pages/Settlements'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/bets" element={<Bets />} />
        <Route path="/members" element={<Members />} />
        <Route path="/settlements" element={<Settlements />} />
      </Routes>
    </Layout>
  )
}
