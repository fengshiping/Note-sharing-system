/**
 * 我的笔记功能
 */

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadMyNotes();
    loadStatistics();
});

// 检查登录状态
function checkLoginStatus() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        alert('请先登录查看我的笔记');
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

// 加载我的笔记
async function loadMyNotes() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    
    // 显示加载状态
    loadingIndicator.style.display = 'block';
    notesList.style.display = 'none';
    emptyState.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:8080/api/notes/my-notes');
        const result = await response.json();
        
        // 隐藏加载状态
        loadingIndicator.style.display = 'none';
        
        if (result.success && result.data.length > 0) {
            displayNotes(result.data);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('加载笔记错误:', error);
        loadingIndicator.style.display = 'none';
        showMessage('加载笔记失败，请稍后重试', 'error');
        showEmptyState();
    }
}

// 加载统计信息
async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:8080/api/notes/my-notes');
        const result = await response.json();
        
        if (result.success) {
            const notes = result.data;
            
            // 总上传数
            document.getElementById('totalNotes').textContent = notes.length;
            
            // 总下载量
            const totalDownloads = notes.reduce((sum, note) => sum + (note.downloadCount || 0), 0);
            document.getElementById('totalDownloads').textContent = totalDownloads;
            
            // 最近7天上传数（简化版本）
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const recentNotes = notes.filter(note => {
                const noteDate = new Date(note.createdTime);
                return noteDate >= oneWeekAgo;
            });
            document.getElementById('recentUploads').textContent = recentNotes.length;
            
            // 最常上传课程
            if (notes.length > 0) {
                const courseCounts = {};
                notes.forEach(note => {
                    const courseName = note.courseName;
                    courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
                });
                
                let topCourse = '--';
                let maxCount = 0;
                for (const [course, count] of Object.entries(courseCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        topCourse = course;
                    }
                }
                document.getElementById('topCourse').textContent = topCourse;
            }
        }
    } catch (error) {
        console.error('加载统计信息错误:', error);
    }
}

// 显示笔记列表
function displayNotes(notes) {
    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    
    notesList.innerHTML = '';
    notesList.style.display = 'flex';
    emptyState.style.display = 'none';
    
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
        day: '2-digit'
    });
    
    // 文件类型图标
    const fileIcon = getFileIcon(note.fileType);
    
    // 下载状态标签
    const downloadStatus = note.downloadCount > 0 
        ? `<span class="badge bg-success">已下载 ${note.downloadCount} 次</span>`
        : '<span class="badge bg-secondary">等待下载</span>';
    
    // 删除按钮 - 我的笔记页面所有笔记都可以删除
    const deleteButton = `
        <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteNote(${note.id})" title="删除笔记">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
        </button>`;
    
    colDiv.innerHTML = `
        <div class="card h-100 note-card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title" style="font-size: 1rem;">${escapeHtml(note.title)}</h5>
                    <div>
                        <span class="badge bg-primary me-1" title="文件类型">${fileIcon}</span>
                        ${downloadStatus}
                        ${deleteButton}
                    </div>
                </div>
                
                <p class="card-text text-muted small mb-3" style="min-height: 40px;">${escapeHtml(note.description || '暂无描述')}</p>
                
                <div class="note-meta">
                    <div class="mb-1">
                        <small class="text-muted">
                            <strong>📚 课程:</strong> ${escapeHtml(note.courseName)}
                        </small>
                    </div>
                    <div class="mb-1">
                        <small class="text-muted">
                            <strong>📅 上传时间:</strong> ${createDate}
                        </small>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">
                            <strong>📏 文件大小:</strong> ${fileSize}
                        </small>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        最后更新: ${createDate}
                    </small>
                    <div>
                        <button class="btn btn-primary btn-sm me-1" 
                                onclick="downloadNote(${note.id}, '${escapeHtml(note.fileName)}')"
                                title="下载笔记">
                            下载
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" 
                                onclick="shareNote(${note.id})"
                                title="分享笔记">
                            分享
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return colDiv;
}

// 删除笔记
async function deleteNote(noteId) {
    if (!confirm('⚠️ 确定要删除这篇笔记吗？\n\n删除后笔记文件和所有数据将无法恢复！')) {
        return;
    }
    
    try {
        showMessage('正在删除笔记...', 'info');
        
        const response = await fetch(`http://localhost:8080/api/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('🎉 笔记删除成功', 'success');
            
            // 重新加载笔记列表和统计信息
            setTimeout(() => {
                loadMyNotes();
                loadStatistics();
            }, 1000);
        } else {
            showMessage('❌ 删除失败: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('删除笔记错误:', error);
        showMessage('❌ 删除失败，请检查网络连接', 'error');
    }
}

// 下载笔记
async function downloadNote(noteId, fileName) {
    try {
        showMessage('正在下载文件...', 'info');
        
        const downloadUrl = `http://localhost:8080/api/notes/${noteId}/download`;
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
            throw new Error('下载失败');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showMessage(`📥 开始下载 "${escapeHtml(fileName)}"`, 'success');
        
        // 重新加载数据以更新下载计数
        setTimeout(() => {
            loadMyNotes();
            loadStatistics();
        }, 1500);
        
    } catch (error) {
        console.error('下载错误:', error);
        showMessage('❌ 下载失败，请稍后重试', 'error');
    }
}

// 分享笔记
function shareNote(noteId) {
    const shareUrl = `${window.location.origin}/notes.html?note=${noteId}`;
    navigator.clipboard.writeText(shareUrl)
        .then(() => {
            showMessage('🔗 分享链接已复制到剪贴板', 'success');
        })
        .catch(err => {
            console.error('复制失败:', err);
            showMessage('❌ 复制失败，请手动复制链接', 'error');
        });
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

// 显示消息提示
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