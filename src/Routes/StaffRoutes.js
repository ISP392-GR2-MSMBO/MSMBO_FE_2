import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import StaffLayout from "../Layouts/StaffLayout";

// Import các trang Staff
import Movies from "../pages/Staff/QuanLiMovie/Movies";
import Showtime from "../pages/Staff/ShowTime/Showtime";
import TheatreReport from "../pages/Staff/BaoCaoRap/TheatreReport";
import CustomerSupport from "../pages/Staff/Support/CustomerSupport";
import Promotion from "../pages/Staff/UuDai/Promotion";
import TopPhim from "../pages/Staff/TopPhimTuan/TopPhim";
import ViewProfileStaff from "../pages/Staff/ProfileStaff/ViewProfileStaff";
import EditProfileStaff from "../pages/Staff/ProfileStaff/EditProfileStaff";
const StaffRoutes = () => {
    return (
        <StaffLayout>
            <Switch>
                <Route path="/staff/movies" component={Movies} />
                <Route path="/staff/showtimes" component={Showtime} />
                <Route path="/staff/reports" component={TheatreReport} />
                <Route path="/staff/support" component={CustomerSupport} />
                <Route path="/staff/profile/view" component={ViewProfileStaff} />
                <Route path="/staff/profile/edit" component={EditProfileStaff} />
                <Route path="/staff/promotions" component={Promotion} />

                <Route path="/staff/topmovies" component={TopPhim} />

                {/* Mặc định chuyển hướng */}
                <Redirect to="/staff/movies" />
            </Switch>
        </StaffLayout>
    );
};

export default StaffRoutes;
