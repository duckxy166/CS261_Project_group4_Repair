package com.example.demo.repository;

import com.example.demo.model.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import jakarta.persistence.*;


@Repository
public interface ReportRepository extends JpaRepository<RepairRequest, Long> {
    List<RepairRequest> findByStatus(String status);
}