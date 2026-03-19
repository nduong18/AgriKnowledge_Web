document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/auth';

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Đăng nhập thành công!');
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    if (data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    alert(data.error || 'Đăng nhập thất bại');
                }
            } catch (error) {
                console.error(error);
                alert('Lỗi kết nối đến máy chủ');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const displayName = document.getElementById('display-name') ? document.getElementById('display-name').value : undefined;

            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, display_name: displayName })
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Đăng ký thất bại');
                }
            } catch (error) {
                console.error(error);
                alert('Lỗi kết nối đến máy chủ');
            }
        });
    }
});
