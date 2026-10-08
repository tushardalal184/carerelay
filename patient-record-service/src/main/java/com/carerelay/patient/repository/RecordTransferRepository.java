package com.carerelay.patient.repository;

import com.carerelay.patient.entity.RecordTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecordTransferRepository extends JpaRepository<RecordTransfer, UUID> {
    Optional<RecordTransfer> findByReferralId(UUID referralId);
}
