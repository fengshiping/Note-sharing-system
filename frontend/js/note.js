/**
 * 笔记列表功能
 */

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadCourses();
    loadNotes();
    setupSearch(); // 新增搜索功能初始化
});

// 检查登录状态
function checkLoginStatus() {
    const userData = localStorage.getItem('user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            document.getElementById('userInfo').textContent = `欢迎，${user.username}`;
            
            // 更新导航栏
            document.getElementById('loginLink').style.display = 'none';
            document.getElementById('registerLink').style.display = 'none';
            document.getElementById('myNotesLink').style.display = 'block';
            
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
        }
    }
}

// 加载课程列表
async function loadCourses() {
    try {
        const response = await fetch('http://localhost:8080/api/courses/list');
        const result = await response.json();
        
        if (result.success) {
            const courseFilter = document.getElementById('courseFilter');
            courseFilter.innerHTML = '<option value="">所有课程</option>';
            
            result.data.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                courseFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载课程错误:', error);
    }
}

// 加载笔记列表
async function loadNotes() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');
    
    // 显示加载状态
    loadingIndicator.style.display = 'block';
    notesList.style.display = 'none';
    emptyState.style.display = 'none';
    resultCount.textContent = '';
    
    try {
        // 获取筛选条件
        const courseId = document.getElementById('courseFilter').value;
        const searchInput = document.getElementById('searchInput');
        const keyword = searchInput ? searchInput.value.trim() : '';
        
        let url = 'http://localhost:8080/api/notes/list';
        
        if (keyword) {
            url = `http://localhost:8080/api/notes/search?keyword=${encodeURIComponent(keyword)}`;
        } else if (courseId) {
            url = `http://localhost:8080/api/notes/course/${courseId}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        // 隐藏加载状态
        loadingIndicator.style.display = 'none';
        
        if (result.success && result.data.length > 0) {
            displayNotes(result.data);
            // 显示结果数量
            resultCount.textContent = `共找到 ${result.data.length} 个结果`;
        } else {
            showEmptyState();
            resultCount.textContent = keyword ? `未找到包含"${keyword}"的笔记` : '暂无笔记';
        }
    } catch (error) {
        console.error('加载笔记错误:', error);
        loadingIndicator.style.display = 'none';
        showMessage('加载笔记失败，请稍后重试', 'error');
        showEmptyState();
    }
}

// 设置搜索功能
function setupSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const keyword = searchInput.value.trim();
            if (keyword) {
                searchNotes(keyword);
            } else {
                loadNotes();
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', function(e) {
            e.preventDefault();
            const keyword = searchInput ? searchInput.value.trim() : '';
            if (keyword) {
                searchNotes(keyword);
            } else {
                loadNotes();
            }
        });
    }
    
    // 实时搜索（可选，500ms延迟）
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const keyword = this.value.trim();
            
            // 只有当输入框为空或关键词长度>=2时才触发搜索
            if (keyword.length === 0 || keyword.length >= 2) {
                searchTimeout = setTimeout(() => {
                    if (keyword) {
                        searchNotes(keyword);
                    } else {
                        loadNotes();
                    }
                }, 500);
            }
        });
    }
}

// 搜索笔记
async function searchNotes(keyword) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');
    const courseFilter = document.getElementById('courseFilter');
    
    // 显示加载状态
    loadingIndicator.style.display = 'block';
    notesList.style.display = 'none';
    emptyState.style.display = 'none';
    resultCount.textContent = '';
    
    try {
        // 重置课程筛选
        if (courseFilter) {
            courseFilter.value = '';
        }
        
        const response = await fetch(`http://localhost:8080/api/notes/search?keyword=${encodeURIComponent(keyword)}`);
        const result = await response.json();
        
        loadingIndicator.style.display = 'none';
        
        if (result.success && result.data.length > 0) {
            displayNotes(result.data);
            // 显示搜索结果数量
            resultCount.textContent = `搜索"${keyword}"找到 ${result.data.length} 个结果`;
        } else {
            showEmptyState();
            resultCount.textContent = `未找到包含"${keyword}"的笔记`;
        }
    } catch (error) {
        console.error('搜索笔记错误:', error);
        loadingIndicator.style.display = 'none';
        showMessage('搜索失败，请稍后重试', 'error');
        showEmptyState();
        resultCount.textContent = '搜索失败';
    }
}

// 加载最新笔记
async function loadRecentNotes() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');
    const searchInput = document.getElementById('searchInput');
    const courseFilter = document.getElementById('courseFilter');
    
    // 显示加载状态
    loadingIndicator.style.display = 'block';
    notesList.style.display = 'none';
    emptyState.style.display = 'none';
    resultCount.textContent = '';
    
    try {
        // 重置搜索和筛选
        if (searchInput) {
            searchInput.value = '';
        }
        if (courseFilter) {
            courseFilter.value = '';
        }
        
        const response = await fetch('http://localhost:8080/api/notes/recent?limit=20');
        const result = await response.json();
        
        loadingIndicator.style.display = 'none';
        
        if (result.success && result.data.length > 0) {
            displayNotes(result.data);
            resultCount.textContent = `显示最新的 ${result.data.length} 篇笔记`;
        } else {
            showEmptyState();
            resultCount.textContent = '暂无最新笔记';
        }
    } catch (error) {
        console.error('加载最新笔记错误:', error);
        loadingIndicator.style.display = 'none';
        showMessage('加载最新笔记失败，请稍后重试', 'error');
        showEmptyState();
        resultCount.textContent = '加载失败';
    }
}

// 显示笔记列表
function displayNotes(notes) {
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    
    notesList.innerHTML = '';
    notesList.style.display = 'flex';
    emptyState.style.display = 'none';
    
    // 添加排序功能
    notes.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
    
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesList.appendChild(noteCard);
    });
}

// 创建笔记卡片
function createNoteCard(note) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-6 col-lg-4 mb-4';
    
    // 格式化文件大小
    const fileSize = formatFileSize(note.fileSize);
    
    // 格式化日期
    const createDate = new Date(note.createdTime).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // 文件类型图标
    const fileIcon = getFileIcon(note.fileType);
    
    // 下载热度指示器
    const downloadHeat = getDownloadHeat(note.downloadCount);
    
    colDiv.innerHTML = `
        <div class="card h-100 note-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title" style="font-size: 1rem;">${escapeHtml(note.title)}</h5>
                    <div>
                        <span class="badge bg-secondary me-1" title="文件类型">${fileIcon}</span>
                        ${downloadHeat}
                    </div>
                </div>
                
                <p class="card-text text-muted small" style="min-height: 40px;">${escapeHtml(note.description || '暂无描述')}</p>
                
                <div class="note-meta">
                    <div class="mb-1">
                        <small class="text-muted">
                            <strong>📚 课程:</strong> ${escapeHtml(note.courseName)}
                        </small>
                    </div>
                    <div class="mb-1">
                        <small class="text-muted">
                            <strong>👤 上传者:</strong> ${escapeHtml(note.uploaderName)}
                        </small>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">
                            <strong>📅 上传时间:</strong> ${createDate}
                        </small>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        📏 ${fileSize} • 📥 ${note.downloadCount} 次下载
                    </small>
                    <button class="btn btn-primary btn-sm download-btn" 
                            onclick="downloadNote(${note.id}, '${escapeHtml(note.fileName)}')"
                            title="下载笔记">
                        下载
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return colDiv;
}

// 获取下载热度指示器
function getDownloadHeat(downloadCount) {
    if (downloadCount >= 100) {
        return '<span class="badge bg-danger" title="热门笔记">🔥</span>';
    } else if (downloadCount >= 50) {
        return '<span class="badge bg-warning" title="较热门笔记">⭐</span>';
    } else if (downloadCount >= 10) {
        return '<span class="badge bg-info" title="受欢迎笔记">👍</span>';
    } else if (downloadCount > 0) {
        return '<span class="badge bg-secondary" title="普通笔记">📄</span>';
    } else {
        return '<span class="badge bg-light text-dark" title="新笔记">🆕</span>';
    }
}

// 下载笔记
async function downloadNote(noteId, fileName) {
    try {
        // 显示下载中提示
        showMessage('正在下载文件...', 'success');
        
        // 创建下载链接
        const downloadUrl = `http://localhost:8080/api/notes/${noteId}/download`;
        
        // 使用fetch下载文件
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error('下载失败');
        }
        
        // 将响应转换为blob
        const blob = await response.blob();
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showMessage(`"${fileName}" 下载开始`, 'success');
        
        // 延迟重新加载笔记列表以更新下载计数
        setTimeout(() => {
            loadNotes();
        }, 1500);
        
    } catch (error) {
        console.error('下载错误:', error);
        showMessage('下载失败，请稍后重试', 'error');
    }
}

// 显示空状态
function showEmptyState() {
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    
    notesList.style.display = 'none';
    emptyState.style.display = 'block';
}

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 工具函数：获取文件类型图标
function getFileIcon(fileType) {
    const icons = {
        'pdf': '📄 PDF',
        'jpg': '🖼️ JPG',
        'jpeg': '🖼️ JPEG',
        'png': '🖼️ PNG',
        'gif': '🖼️ GIF'
    };
    return icons[fileType] || '📁 未知';
}

// 工具函数：HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示消息提示（复用）
function showMessage(message, type = 'success') {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}