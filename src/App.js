import Navbar from './Navbar';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch, useLocation } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// giả sử bạn đã có các component sau
import Phim from './component-phim/Phim';
import PhimSapChieu from './component-phim/PhimSapChieu';
import Login from './component-phim/Login';
import Register from './component-phim/Register';
import LichChieu from './component-phim/LichChieu';
import GiaVe from './component-phim/GiaVe';
import UuDai from './component-phim/UuDai';
import LienHe from './component-phim/LienHe';
import Footer from './Footer'; // import footer
import MovieDetail from "./component-phim/MovieDetail"; // ✅ import trang chi tiết phim
import StaffDashBoard from "./components/StaffDashBoard";
import ReviewMovie from './components/ReviewMovie';
import ThreatherReport from './components/ThreatherReport'
import CustomerSupport from './components/CustomerSupport';

function AppContent() {
  const location = useLocation();
  const isStaffDashboard = location.pathname.startsWith('/staff-dashboard');
  return (
    <div className="App">
      {!isStaffDashboard && <Navbar />}
      <div className="content">
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/phim">
            <Phim />
          </Route>
          <Route path="/phim-sap-chieu">
            <PhimSapChieu />
          </Route>
          <Route path="/lich-chieu">
            <LichChieu />
          </Route>
          <Route path="/gia-ve">
            <GiaVe />
          </Route>
          <Route path="/uu-dai">
            <UuDai />
          </Route>
          <Route path="/lien-he">
            <LienHe />
          </Route>
          <Route path="/movies/:id">
            <MovieDetail />
          </Route>

   
          <Route path="/staff-dashboard">
            <StaffDashBoard />
          </Route>
          <Route path="/review-movie">
            <ReviewMovie />
          </Route>
          <Route path="/threather-report">
            <ThreatherReport />
          </Route>
          <Route path="/customer-support">
            <CustomerSupport />
          </Route>
        </Switch>
      </div>
      {/* Footer đặt ngoài Switch, luôn hiển thị */}
      {!isStaffDashboard && <Footer />}
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
