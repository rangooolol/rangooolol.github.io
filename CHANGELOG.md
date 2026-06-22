# Development Changelog

## v0.4.0 - BodyParts3D real muscle GLB model

- Replaced the hand-built simplified 3D body with a real segmented muscle GLB generated from BodyParts3D / Anatomography data.
- Added 15 common clickable muscle groups: pectoralis major, serratus anterior, sternocleidomastoid, deltoid, trapezius, splenius, biceps, triceps, quadriceps, hamstrings, gluteus maximus, gluteus medius, gastrocnemius, soleus, and adductors.
- Added a subtle non-clickable body outline behind the real muscle meshes so ordinary users can understand the anatomy in full-body context.
- Mapped coach-marked issues and weekly training targets to the real GLB muscle objects so active and high-tension areas are highlighted on the model.
- Restored static page copy to readable Chinese and added visible BodyParts3D / CC BY 4.0 attribution in the model legend.
- Added the optimized web model asset at `assets/models/common-muscles.bodyparts3d.glb`.

## v0.3.0 - Clickable muscle anatomy model

- Replaced the rounded body model with a more anatomy-like colored muscle model.
- Added common muscle groups for ordinary users to recognize: chest, neck, trapezius, deltoid, biceps, forearm flexors, abs, obliques, lats, glutes, quads, hamstrings, calves, and adductors.
- Added click detection on 3D muscle blocks so the selected muscle name appears on the model panel.
- Kept existing issue highlighting, AI discomfort predictions, and training mapping connected to the new muscle groups.
- Updated the agent workflow rule: local preview servers must run in the background with log files and port checks.

## v0.2.0 - Consultation conversion flow

- Added a product requirement breakdown for the consultation conversion workflow.
- Added a consultation journey from body scan to discomfort prediction, training prescription, and proof cases.
- Added AI-style discomfort predictions based on coach-marked body issues.
- Added model overlay badges for predicted discomfort areas.
- Added a 4-step training prescription module answering "what should I train".
- Added similar case cards with before/after visual comparison and improvement data.
- Updated project workflow rules: every future GitHub sync must include a clear version update record here.

## v0.1.0 - Initial prototype

- Built the single-member fitness coaching web prototype.
- Added 3D body visualization, issue marking, weekly training plan, and coach issue input.
- Published the site through GitHub Pages.
