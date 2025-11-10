import {
  BrowserRouter as Router,
  Route,
  Switch,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./Home";
import Login from "./pages/Manager/Login";
import Register from "./pages/Customer/DangKi/Register";
import ManagerPage from "./pages/Manager/ManagerPage";
import Phim from "./pages/Customer/Phim";
import LichChieu from "./pages/Customer/LichChieu";
import GiaVe from "./pages/Customer/GiaVe";
import UuDai from "./pages/Customer/UuDai";
import LienHe from "./pages/Customer/LienHe";
import MovieDetail from "./pages/Customer/MovieDetail";
import Seatmap from "./pages/Customer/Seatmap";
import PhimSapChieu from "./pages/Customer/PhimSapChieu";
import ViewCustomerProfile from "./pages/Customer/Profile/ViewCustomerProfile";
import EditProfileCustomer from "./pages/Customer/Profile/EditProfileCustomer";
import BookingDetail from "./pages/Customer/Profile/BookingDetail";
import DieuKhoang from "./pages/Customer/ChinhSachVaDieuKhoang/DieuKhoang";
import ChinhSach from "./pages/Customer/ChinhSachVaDieuKhoang/ChinhSach";
import PaymentSuccess from "./pages/Customer/Payment/PaymentSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentFail from "./pages/Customer/Payment/PaymentFail";
import StaffRoutes from "./Routes/StaffRoutes";
import ForgotPassword from "./pages/Customer/DangKi/ForgotPassword";
import ResetPassword from "./pages/Customer/DangKi/ResetPassword";


import AdminRoutes from "./Routes/AdminRoutes";

function App() {
  return (
    <Router>
      <Route
        path="/"
        render={({ location }) => {
          // ✅ Đảm bảo isManagerPage là TRUE cho mọi path con của /manager
          const currentPath = location.pathname;
          const isManagerPage = location.pathname.startsWith("/manager");
          const isStaffPage = currentPath.startsWith("/staff");
          const isAdminPage = currentPath.startsWith("/admin");

          const shouldHideNavAndFooter = isManagerPage || isStaffPage || isAdminPage;
          return (
            <div className="App">
              {/* Ẩn Navbar và Footer khi vào khu vực Manager */}
              {!shouldHideNavAndFooter && <Navbar />}
              <div className="content">
                <Switch>
                  {/* ====== CUSTOMER ROUTES ====== */}
                  <Route exact path="/" component={Home} />
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Register} />
                  <Route path="/phim" component={Phim} />
                  <Route path="/phim-sap-chieu" component={PhimSapChieu} />
                  <Route path="/lich-chieu" component={LichChieu} />
                  <Route path="/gia-ve" component={GiaVe} />
                  <Route path="/uu-dai" component={UuDai} />
                  <Route path="/lien-he" component={LienHe} />
                  <Route path="/movies/:name" component={MovieDetail} />
                  <Route path="/seatmap/:id" component={Seatmap} />
                  <Route path="/profile" component={ViewCustomerProfile} />
                  <Route path="/edit-profile" component={EditProfileCustomer} />
                  <Route path="/book/:showtimeId" component={Seatmap} />
                  <Route exact path="/booking" component={BookingDetail} />
                  <Route path="/booking/:bookingId" component={BookingDetail} />
                  <Route path="/payment-success" component={PaymentSuccess} />
                  <Route path="/payment-result" component={PaymentSuccess} />
                  <Route path="/dieu-khoan" component={DieuKhoang} />
                  <Route path="/chinh-sach-bao-mat" component={ChinhSach} />
                  <Route path="/payment-fail" component={PaymentFail} />
                  <Route path="/payment-failed" component={PaymentFail} />
                  <Route path="/payment-cancel" component={PaymentFail} />

                  <ProtectedRoute
                    path="/staff"
                    component={StaffRoutes}
                    requiredRole="ST" // Thay 'STAFF' bằng role code thực tế của Staff
                  />
                  <ProtectedRoute
                    path="/admin"
                    component={AdminRoutes}
                    requiredRole="AD" // Thay 'ADMIN' bằng role code thực tế của Admin
                  />
                  <Route path="/forgot-password" component={ForgotPassword} />
                  <Route path="/reset-password" component={ResetPassword} />
                  {/* ====== ADMIN ROUTE (Manager) ====== */}
                  <ProtectedRoute
                    path="/manager"
                    component={ManagerPage}
                    requiredRole="MA"
                  />
                </Switch>
              </div>
              {!shouldHideNavAndFooter && <Footer />}
            </div>
          );
        }}
      />
    </Router>
  );
}

export default App;