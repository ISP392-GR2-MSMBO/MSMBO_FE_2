import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import AdminLayout from "../Layouts/AdminLayout";

import UserManagement from "../pages/Admin/UserManagement";
import Profile from "../pages/Admin/AdminProfile/AdminProfile";
import SystemReport from "../pages/Admin/SystemReport";

const AdminRoutes = () => {
    return (
        <AdminLayout>
            <Switch>
                <Route path="/admin/users" component={UserManagement} />
                <Route path="/admin/profile" component={Profile} />
                <Route path="/admin/reports" component={SystemReport} />

                <Redirect to="/admin/users" />
            </Switch>
        </AdminLayout>
    );
};

export default AdminRoutes;
