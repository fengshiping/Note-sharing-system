package com.noteshare.controller;

import com.noteshare.dto.ApiResponse;
import com.noteshare.dto.LoginRequest;
import com.noteshare.dto.RegisterRequest;
import com.noteshare.entity.User;
import com.noteshare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ApiResponse register(@RequestBody RegisterRequest request, HttpSession session) {
        try {
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return ApiResponse.error("两次输入的密码不一致");
            }

            if (request.getPassword().length() < 6) {
                return ApiResponse.error("密码长度至少6位");
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());

            User savedUser = userService.register(user);
            session.setAttribute("user", savedUser);

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", savedUser.getId());
            userInfo.put("username", savedUser.getUsername());
            userInfo.put("email", savedUser.getEmail());

            return ApiResponse.success("注册成功", userInfo);

        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            User user = userService.login(request.getUsername(), request.getPassword());
            session.setAttribute("user", user);

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());

            return ApiResponse.success("登录成功", userInfo);

        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ApiResponse logout(HttpSession session) {
        session.invalidate();
        return ApiResponse.success("退出成功");
    }

    @GetMapping("/check")
    public ApiResponse checkLogin(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            return ApiResponse.success("已登录", userInfo);
        } else {
            return ApiResponse.error("未登录");
        }
    }
}