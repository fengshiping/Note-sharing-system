package com.noteshare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoteResponse {
    private Long id;
    private String title;
    private String description;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Integer downloadCount;
    private LocalDateTime createdTime;
    private String courseName;
    private String uploaderName;
    private Long uploaderId; // 新增：上传者ID

    // 文件下载URL
    private String downloadUrl;

    // 是否可以删除（前端根据当前用户判断）
    private boolean deletable;
}