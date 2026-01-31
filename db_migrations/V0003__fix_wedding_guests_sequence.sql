-- Синхронизация последовательности ID для wedding_guests
SELECT setval('t_p99017603_wedding_invite_blue.wedding_guests_id_seq', COALESCE((SELECT MAX(id) FROM t_p99017603_wedding_invite_blue.wedding_guests), 1), true);
