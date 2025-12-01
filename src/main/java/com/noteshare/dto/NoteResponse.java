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

    // 文件下载URL
    private String downloadUrl;
}