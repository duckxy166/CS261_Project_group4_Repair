package com.example.demo.repository;

import com.example.demo.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
	  List<Attachment> findByRepairRequestId(Long repairRequestId);
	}
