/**
 * 笔记上传功能
 */

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadCourses();
    setupUploadForm();
});

// 检查登录状态
function checkLoginStatus() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        alert('请先登录后再上传笔记');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        document.getElementById('userInfo').textContent = `欢迎，${user.username}`;
        
        // 更新导航栏
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('registerLink').style.display = 'none';
        
        const logoutLink = document.getElementById('logoutLink');
        logoutLink.style.display = 'block';
        logoutLink.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        };
    } catch (e) {
        console.error('解析用户数据失败:', e);
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// 加载课程列表
async function loadCourses() {
    try {
        const response = await fetch('http://localhost:8080/api/courses/list');
        const result = await response.json();
        
        if (result.success) {
            const courseSelect = document.getElementById('courseId');
            courseSelect.innerHTML = '<option value="">请选择课程...</option>';
            
            result.data.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });
        } else {
            showMessage('加载课程列表失败: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('加载课程错误:', error);
        showMessage('网络错误，无法加载课程列表', 'error');
    }
}

// 设置上传表单
function setupUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    
    // 保存按钮原始文本
    submitButton.setAttribute('data-original-text', submitButton.innerHTML);
    
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const courseId = document.getElementById('courseId').value;
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];
        
        // 表单验证
        if (!title) {
            showMessage('请输入笔记标题', 'error');
            return;
        }
        
        if (!courseId) {
            showMessage('请选择课程', 'error');
            return;
        }
        
        if (!file) {
            showMessage('请选择要上传的文件', 'error');
            return;
        }
        
        // 文件类型验证
        const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            showMessage('不支持的文件类型，请选择PDF或图片文件', 'error');
            return;
        }
        
        // 文件大小验证 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showMessage('文件大小不能超过10MB', 'error');
            return;
        }
        
        // 设置加载状态
        setLoading(submitButton, true);
        
        try {
            // 创建FormData对象
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('courseId', courseId);
            formData.append('file', file);
            
            // 发送上传请求
            const response = await fetch('http://localhost:8080/api/notes/upload', {
                method: 'POST',
                body: formData
                // 注意：不要设置Content-Type，浏览器会自动设置multipart/form-data
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('笔记上传成功！正在跳转到笔记列表...', 'success');
                // 2秒后跳转到笔记列表
                setTimeout(() => {
                    window.location.href = 'notes.html';
                }, 2000);
            } else {
                showMessage('上传失败: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('上传错误:', error);
            showMessage('网络错误，请稍后重试', 'error');
        } finally {
            setLoading(submitButton, false);
        }
    });
}

// 显示消息提示（复用auth.js中的函数）
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

// 设置加载状态（复用auth.js中的函数）
function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> 上传中...';
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text');
        button.classList.remove('loading');
    }
}