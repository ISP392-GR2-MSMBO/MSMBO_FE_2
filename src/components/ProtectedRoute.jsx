import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useLocalStorage } from "../hook/useLocalStorage";

// ✅ Component bảo vệ route
const ProtectedRoute = ({ component: Component, requiredRole, ...rest }) => {
    const [user] = useLocalStorage("user", null);

    return (
        <Route
            {...rest}
            render={(props) => {
                // ❌ Nếu chưa đăng nhập
                if (!user) {
                    return <Redirect to="/login" />;
                }

                // ❌ Nếu không đúng vai trò (vd: không phải Manager)
                if (requiredRole && user.roleID !== requiredRole) {
                    return <Redirect to="/" />;
                }

                // ✅ Nếu hợp lệ → vào được trang đó
                return <Component {...props} />;
            }}
        />
    );
};

export default ProtectedRoute;
