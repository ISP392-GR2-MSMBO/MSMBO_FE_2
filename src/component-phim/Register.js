import '../phim-css/Login.css';
const Register = () => {
  return(<div className="auth-container">
      <h2>Đăng ký</h2>
      <form className="auth-form">
            <input type="username" placeholder="Username" required/><br></br>
            <input type="email" placeholder="Email" required/><br></br>
            <input type="password" placeholder="Password" required/><br></br>
            <input type="password" placeholder="Confirm Password" required/><br></br>
            <button type="submit">Đăng ký</button>
      </form>
      <p className="auth-link">
      Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
      </p>
    </div>);
  
};

export default Register;
