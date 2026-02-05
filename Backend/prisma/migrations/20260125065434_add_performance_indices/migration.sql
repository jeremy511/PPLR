-- CreateIndex
CREATE INDEX "Publisher_email_idx" ON "public"."Publisher"("email");

-- CreateIndex
CREATE INDEX "Shift_date_idx" ON "public"."Shift"("date");

-- CreateIndex
CREATE INDEX "Shift_zoneId_date_idx" ON "public"."Shift"("zoneId", "date");
