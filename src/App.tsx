/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#3B1F10] text-[#F5ECD7] font-sans" dir="rtl">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route element={<Layout />}>
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
