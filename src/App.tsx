import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages
import Beranda from "./pages/Beranda";
import Seminar from "./pages/Seminar";
import Competition from "./pages/Competition";
import Talkshow from "./pages/Talkshow";
import Workshop from "./pages/Workshop";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import EventEdit from "./pages/event/EventEdit";
import CategoryEdit from "./pages/Kategori/CategoryEdit";
import PembicaraEdit from "./pages/pembicara/PembicaraEdit";

// dashboard pages
import CategoryIndex from "./pages/Kategori/CategoryIndex";
import CategoryCreate from "./pages/Kategori/CategoryCreate";

//event
import EventIndex from "./pages/event/EventIndex";
import EventCreate from "./pages/event/EventCreate";

//pembicara
import PembicaraCreate from "./pages/pembicara/PembicaraCreate"; 
import PembicaraIndex from "./pages/pembicara/PembicaraIndex";

// user (Tambahan Baru)
import UserIndex from "./pages/users/userIndex";
import UserCreate from "./pages/users/userCreate";
import UserEdit from "./pages/users/userEdit"; // <-- 1. PERBAIKAN: Tambahkan import untuk Edit User ini

// layout
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// route
import ProtectedRoute from "./route/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= MAIN ================= */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Beranda />} />
          <Route path="/competition" element={<Competition />} />
          <Route path="/seminar" element={<Seminar />} />
          <Route path="/workshop" element={<Workshop />} />
          <Route path="/talkshow" element={<Talkshow />} />
        </Route>

        {/* ================= AUTH ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ================= PROTECTED ================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Category */}
            <Route path="/dashboard/category" element={<CategoryIndex />} />
            <Route path="/dashboard/category/create" element={<CategoryCreate />} />
            <Route path="/dashboard/category/edit/:id" element={<CategoryEdit />} />
            
            {/* Event */}
            <Route path="/dashboard/event" element={<EventIndex />} />
            <Route path="/dashboard/event/create" element={<EventCreate />} />
            <Route path="/dashboard/event/edit/:id" element={<EventEdit />} />
            
            {/* Pembicara */}
            <Route path="/dashboard/pembicara" element={<PembicaraIndex />} />
            <Route path="/dashboard/pembicara/create" element={<PembicaraCreate />} />
            <Route path="/dashboard/pembicara/edit/:id" element={<PembicaraEdit />} />

            {/* User (Tambahan Baru) */}
            <Route path="/dashboard/user" element={<UserIndex />} />
            <Route path="/dashboard/user/create" element={<UserCreate />} />
            <Route path="/dashboard/user/edit/:id" element={<UserEdit />} /> {/* <-- 2. PERBAIKAN: Tambahkan route edit ini */}
            
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;