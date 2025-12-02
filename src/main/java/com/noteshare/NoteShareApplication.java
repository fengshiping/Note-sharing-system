package com.noteshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(
        scanBasePackages = {
                "com.noteshare",
                "com.noteshare.controller",
                "com.noteshare.service",
                "com.noteshare.repository"
        }
)
@EntityScan("com.noteshare.entity")
@EnableJpaRepositories("com.noteshare.repository")
public class NoteShareApplication {

    public static void main(String[] args) {
        SpringApplication.run(NoteShareApplication.class, args);
        System.out.println("======================================");
        System.out.println("✅ 笔记共享系统后端启动成功！");
        System.out.println("✅ 访问地址: http://localhost:8080");
        System.out.println("✅ 测试接口: http://localhost:8080/api/auth/test");
        System.out.println("======================================");
    }
}