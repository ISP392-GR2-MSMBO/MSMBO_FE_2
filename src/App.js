import Navbar from './Navbar';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// giả sử bạn đã có các component sau
import Phim from './Phim';
import LichChieu from './LichChieu';
import GiaVe from './GiaVe';
import UuDai from './UuDai';
import LienHe from './LienHe';
import Footer from './Footer'; // import footer
import MovieDetail from "./MovieDetail"; // ✅ import trang chi tiết phim
import Register from './Register';
import Login from './Login';
import Seatmap from './seatmap';


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
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

            <Route path="/seatmap/:id">
              <Seatmap />
            </Route>

          </Switch>
        </div>

        {/* Footer đặt ngoài Switch, luôn hiển thị */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
