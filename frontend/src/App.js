import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Admissions from "@/pages/Admissions";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Toaster position="top-right" richColors />
                    <Routes>
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/*" element={<AdminDashboard />} />
                        <Route element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="/admissions" element={<Admissions />} />
                            <Route path="/gallery" element={<Gallery />} />
                            <Route path="/contact" element={<Contact />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}

export default App;
