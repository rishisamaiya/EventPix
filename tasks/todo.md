# Guest Info Capture & Session Logging

## Plan
- [x] Write plan to `tasks/todo.md`
- [x] Add `guestName` and `guestPhone` to `src/components/selfie-capture.tsx`
- [x] Add `GuestInfoStep` view between Consent and Camera
- [x] Update `onCapture` to pass `(imageData, imgElement, guestName, guestPhone)`
- [x] Update `src/app/e/[slug]/guest-gallery.tsx` to handle new signature of `onCapture`
- [x] Pass `guestName` and `guestPhone` in the API call to `/api/match-faces`
- [x] Update `src/app/api/rekognition/search-faces/route.ts` to `INSERT INTO guest_sessions`
- [x] Verify guest logs show up inside the dashboard

## Review
- Successfully intercepted the selfie capture flow to enforce Name capture.
- Phone is optional.
- Session logs are correctly inserted with match count, guest name, and phone.
