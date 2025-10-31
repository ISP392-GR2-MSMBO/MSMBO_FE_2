import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./Home";
import Login from "./pages/Admin/Login";
import Register from "./pages/Customer/Register";
import AdminPage from "./pages/Admin/AdminPage"; // ✅ Đổi từ AdminLayout thành AdminPage
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
import Payment from "./pages/Customer/Payment/Payment";
import BookingDetail from "./pages/Customer/Profile/BookingDetail";
import DieuKhoang from "./pages/Customer/ChinhSachVaDieuKhoang/DieuKhoang"; // ✅ IMPORT MỚI
import ChinhSach from "./pages/Customer/ChinhSachVaDieuKhoang/ChinhSach";   // ✅ IMPORT MỚI
function AppContent() {
  const location = useLocation();

  // 🔹 Kiểm tra nếu đang trong khu vực admin
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="App">
      {/* Ẩn Navbar và Footer khi đang ở khu vực admin */}
      {!isAdminPage && <Navbar />}

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

          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route exact path="/booking" component={BookingDetail} /> {/* ✅ hiển thị danh sách */}
          <Route path="/booking/:bookingId" component={BookingDetail} />

          {/* ✅ ROUTE MỚI: Điều khoản sử dụng */}
          <Route path="/dieu-khoan" component={DieuKhoang} />
          {/* ✅ ROUTE MỚI: Chính sách bảo mật */}
          <Route path="/chinh-sach-bao-mat" component={ChinhSach} />
          {/* ====== ADMIN LAYOUT ROUTES ====== */}
          <Route path="/admin" component={AdminPage} />
        </Switch>
      </div>

      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
