package com.example.demo.service;

import com.example.demo.repository.UserRepository;
import com.example.demo.model.UserData;
//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

//import java.util.List;
//import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserData createUser(UserData user) {
        return userRepository.save(user);
    }
}