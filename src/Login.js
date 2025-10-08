import './index.css';
const Login = () => {
    return (
        <div className="auth-container">
            <h2>Đăng nhập</h2>
            <form className="auth-form">
                <input type="username" placeholder="Username" required /><br></br>
                <input type="password" placeholder="Password" required /><br></br>
                <button type="submit">Đăng nhập</button>
            </form>
            <p className="auth-link">
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </p>
        </div>

    );
};

export default Login;