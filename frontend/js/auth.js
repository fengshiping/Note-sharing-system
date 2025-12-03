/**
 * 笔记共享系统 - 用户认证功能
 * 包含注册、登录、退出等功能
 */

// 显示消息提示
function showMessage(message, type = 'success') {
    // 移除现有的消息提示
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 创建新的消息提示
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // 将消息提示插入到页面顶部
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // 3秒后自动消失
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// 显示加载状态
function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> 处理中...';
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text');
        button.classList.remove('loading');
    }
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 验证用户名格式
function isValidUsername(username) {
    return username.length >= 3 && username.length <= 20;
}

// 验证密码强度
function isValidPassword(password) {
    return password.length >= 6;
}

// 注册功能
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        // 保存按钮原始文本
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.setAttribute('data-original-text', submitButton.innerHTML);
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            // 前端验证
            if (!isValidUsername(formData.username)) {
                showMessage('用户名长度应为3-20个字符', 'error');
                return;
            }

            if (!isValidEmail(formData.email)) {
                showMessage('请输入有效的邮箱地址', 'error');
                return;
            }

            if (!isValidPassword(formData.password)) {
                showMessage('密码长度至少6位', 'error');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                showMessage('两次输入的密码不一致！', 'error');
                return;
            }

            // 设置加载状态
            setLoading(submitButton, true);

            try {
                // 发送注册请求到后端
                const response = await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    showMessage('注册成功！正在跳转到登录页面...');
                    // 2秒后跳转到登录页
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    showMessage('注册失败：' + result.message, 'error');
                }
            } catch (error) {
                console.error('注册错误:', error);
                showMessage('网络错误，请检查后端服务是否启动', 'error');
            } finally {
                setLoading(submitButton, false);
            }
        });
    }
});

// 登录功能
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // 保存按钮原始文本
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.setAttribute('data-original-text', submitButton.innerHTML);
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value
            };

            // 基础验证
            if (!formData.username) {
                showMessage('请输入用户名', 'error');
                return;
            }

            if (!formData.password) {
                showMessage('请输入密码', 'error');
                return;
            }

            // 设置加载状态
            setLoading(submitButton, true);

            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    showMessage('登录成功！正在跳转到首页...');
                    // 保存用户信息到本地存储
                    localStorage.setItem('user', JSON.stringify(result.data));
                    // 2秒后跳转到首页
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showMessage('登录失败：' + result.message, 'error');
                }
            } catch (error) {
                console.error('登录错误:', error);
                showMessage('网络错误，请检查后端服务是否启动', 'error');
            } finally {
                setLoading(submitButton, false);
            }
        });
    }
});

// 首页用户状态显示
document.addEventListener('DOMContentLoaded', function() {
    const userInfo = document.getElementById('userInfo');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    
    if (userInfo) {
        // 检查用户是否已登录
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                userInfo.textContent = `欢迎，${user.username}`;
                
                // 隐藏登录注册链接，显示退出链接
                if (loginLink && registerLink) {
                    loginLink.style.display = 'none';
                    registerLink.style.display = 'none';
                    
                    // 创建退出链接
                    const logoutLink = document.createElement('a');
                    logoutLink.className = 'nav-link';
                    logoutLink.href = '#';
                    logoutLink.innerHTML = '退出';
                    logoutLink.onclick = function(e) {
                        e.preventDefault();
                        localStorage.removeItem('user');
                        window.location.href = 'login.html';
                    };
                    
                    loginLink.parentNode.appendChild(logoutLink);
                }
            } catch (e) {
                console.error('解析用户数据失败:', e);
                localStorage.removeItem('user');
            }
        }
    }
});

// 页面加载时检查登录状态
window.addEventListener('load', function() {
    // 如果当前在登录/注册页且已登录，跳转到首页
    const currentPage = window.location.pathname;
    if ((currentPage.includes('login.html') || currentPage.includes('register.html')) && localStorage.getItem('user')) {
        window.location.href = 'index.html';
    }
});