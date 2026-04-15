package com.inkslot.backend.repository;

import com.inkslot.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByArtistIdOrderByCreatedAtDesc(Long artistId);
    List<Booking> findByArtistIdAndStatusOrderByCreatedAtDesc(Long artistId, String status);
    Optional<Booking> findByReferenceNumber(String referenceNumber);
    long countByArtistIdAndStatus(Long artistId, String status);
}
