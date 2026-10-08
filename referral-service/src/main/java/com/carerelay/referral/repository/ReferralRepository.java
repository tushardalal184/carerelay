package com.carerelay.referral.repository;

import com.carerelay.referral.entity.Referral;
import com.carerelay.referral.entity.ReferralStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, UUID> {

    Page<Referral> findByReceivingDoctorId(UUID receivingDoctorId, Pageable pageable);

    Page<Referral> findByReferringDoctorId(UUID referringDoctorId, Pageable pageable);

    @Query("SELECT r FROM Referral r WHERE r.receivingDoctorId = :doctorId AND r.status IN ('PENDING', 'ACCEPTED', 'RECORD_TRANSFERRED') ORDER BY r.slaDeadline ASC")
    List<Referral> findActiveQueueByDoctor(@Param("doctorId") UUID doctorId);

    @Query("SELECT r FROM Referral r WHERE r.slaDeadline < :now AND r.status NOT IN ('COMPLETED', 'CANCELLED', 'FAILED')")
    List<Referral> findSlaBreached(@Param("now") Instant now);

    long countByStatus(ReferralStatus status);

    @Query("SELECT count(r) FROM Referral r WHERE r.slaDeadline < :now AND r.status NOT IN ('COMPLETED', 'CANCELLED', 'FAILED')")
    long countSlaBreached(@Param("now") Instant now);
}
