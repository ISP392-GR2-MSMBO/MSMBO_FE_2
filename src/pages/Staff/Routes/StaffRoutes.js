import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import StaffLayout from "./StaffLayout";

// Import các trang Staff
import Movies from "../Movies";
import Showtime from "../Showtime";
import TheatreReport from "../TheatreReport";
import CustomerSupport from "../CustomerSupport";
import Promotion from "../Promotion";
import TopPhim from "../TopPhim";
import ViewProfileStaff from "../ProfileStaff/ViewProfileStaff";
import EditProfileStaff from "../ProfileStaff/EditProfileStaff";
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
